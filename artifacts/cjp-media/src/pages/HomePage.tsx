import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { collection, query, orderBy, limit, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  Flame, ArrowRight, TrendingUp, Newspaper, Eye,
  ChevronRight, Megaphone, Zap, Clock,
  MessageCircle, ArrowUpRight, Radio, Mic2, Landmark, Bookmark,
} from "lucide-react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import VerifiedBadge from "../components/VerifiedBadge";
import { formatDistanceToNow } from "date-fns";

/* ─── helpers ─── */
const getImg = (post: any) =>
  post.imageUrls?.[0] || post.imageUrl || post.heroUrl || post.coverImage || "";

const fmtNum = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `${(n / 1_000).toFixed(1)}K`
  : String(n);

const ago = (createdAt: any) => {
  try {
    const d = typeof createdAt?.toDate === "function" ? createdAt.toDate() : new Date(createdAt);
    return formatDistanceToNow(d, { addSuffix: true }).replace("about ", "");
  } catch { return ""; }
};

/* ─── config ─── */
const CATEGORIES = [
  { href: "/category/Trending",    label: "Trending",    Icon: TrendingUp, color: "#ff4500", bg: "rgba(255,69,0,0.12)" },
  { href: "/category/Politics",    label: "Politics",    Icon: Landmark,   color: "#1d9bf0", bg: "rgba(29,155,240,0.12)" },
  { href: "/category/Satire",      label: "Satire",      Icon: Mic2,       color: "#ccff00", bg: "rgba(204,255,0,0.10)" },
  { href: "/category/Youth Voice", label: "Youth Voice", Icon: Megaphone,  color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  { href: "/category/Breaking",    label: "Breaking",    Icon: Zap,        color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { href: "/feed",                 label: "All Posts",   Icon: Newspaper,  color: "#00ba7c", bg: "rgba(0,186,124,0.12)" },
];

/* ─── shared components ─── */
function SectionTitle({
  accent, children, href, badge,
}: { accent: string; children: React.ReactNode; href?: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-[3px] h-5 rounded-full" style={{ backgroundColor: accent }} />
        <h2 className="text-white font-black text-[17px] sm:text-[19px] tracking-tight">{children}</h2>
        {badge && (
          <span className="text-[10px] font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-full text-black" style={{ backgroundColor: accent }}>{badge}</span>
        )}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-white/25 hover:text-[#ccff00] text-[12px] font-semibold transition-colors group">
          See all <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#0d0d0d] border border-white/[0.04] overflow-hidden animate-pulse ${className}`}>
      <div className="aspect-video bg-white/[0.03]" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-2 bg-white/[0.03] rounded-full w-1/4" />
        <div className="h-4 bg-white/[0.03] rounded-full w-full" />
        <div className="h-4 bg-white/[0.03] rounded-full w-3/4" />
        <div className="h-3 bg-white/[0.02] rounded-full w-1/2 mt-1" />
      </div>
    </div>
  );
}

/* ─── card: hero size ─── */
function HeroCard({ post }: { post: any }) {
  const img = getImg(post);
  return (
    <Link
      href={`/post/${post.id}`}
      className="group relative rounded-2xl overflow-hidden border border-white/[0.07] hover:border-white/[0.2] transition-all duration-500 block cursor-pointer"
      style={{ minHeight: 400 }}
    >
      {img ? (
        <img src={img} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
      ) : (
        <div className="absolute inset-0 bg-[#0d0d0d] flex items-center justify-center">
          <Flame className="w-12 h-12 text-white/[0.04]" />
        </div>
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, transparent 30%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.97) 100%)" }} />

      {post.category && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-[0.14em] px-3 py-1.5 rounded-full">
            {post.category}
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10">
        {post.roast && (
          <p className="text-[#ccff00]/50 text-[11px] italic mb-2 line-clamp-1">{post.roast}</p>
        )}
        <h3 className="text-white font-black text-[18px] sm:text-[22px] leading-[1.2] mb-3.5 group-hover:text-[#ccff00] transition-colors duration-300 line-clamp-3">
          {post.title}
        </h3>
        <div className="flex items-center gap-3 text-white/30 text-[11px] font-medium">
          <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(post.viewsCount || 0)}</span>
          <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
          <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />{post.commentsCount || 0}</span>
          <span className="ml-auto flex items-center gap-1 text-white/20">
            <Clock className="w-3 h-3" />{ago(post.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── card: medium stacked ─── */
function MedCard({ post, tall }: { post: any; tall?: boolean }) {
  const img = getImg(post);
  return (
    <Link
      href={`/post/${post.id}`}
      className="group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.18] transition-all duration-300 flex flex-col cursor-pointer"
      style={{ minHeight: tall ? 200 : 155 }}
    >
      {img ? (
        <img src={img} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700" />
      ) : (
        <div className="absolute inset-0 bg-[#0d0d0d]" />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.08) 100%)" }} />

      {post.category && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-black/60 backdrop-blur-sm border border-white/[0.08] text-white/50 text-[9px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full">
            {post.category}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
        <h3 className="text-white font-bold text-[13px] leading-snug mb-1.5 group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
        <div className="flex items-center gap-2.5 text-white/25 text-[10px]">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount || 0)}</span>
          <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
          <span className="ml-auto">{ago(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

/* ─── card: compact horizontal ─── */
function SmCard({ post, rank }: { post: any; rank?: number }) {
  const img = getImg(post);
  return (
    <Link
      href={`/post/${post.id}`}
      className="group flex gap-3 rounded-xl border border-white/[0.05] hover:border-white/[0.14] hover:bg-white/[0.025] transition-all p-3 cursor-pointer items-start"
    >
      {rank !== undefined && (
        <span className="text-[18px] font-black text-white/10 w-5 shrink-0 leading-none mt-1 tabular-nums group-hover:text-white/25 transition-colors">{rank}</span>
      )}
      <div className="w-[72px] h-[56px] rounded-lg overflow-hidden shrink-0 relative bg-[#0d0d0d]">
        {img && <img src={img} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        {post.category && (
          <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.14em] mb-0.5">{post.category}</span>
        )}
        <h3 className="text-white font-semibold text-[13px] leading-snug group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
        <div className="flex items-center gap-2 mt-1.5 text-white/20 text-[10px]">
          <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{fmtNum(post.viewsCount || 0)}</span>
          <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
          <span className="ml-auto">{ago(post.createdAt)}</span>
        </div>
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-white/[0.09] group-hover:text-[#ccff00]/50 transition-colors shrink-0 mt-1" />
    </Link>
  );
}

/* ─── page ─── */
export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [profileSettings, setProfileSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [totalReactions, setTotalReactions] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "profile"));
        if (snap.exists()) setProfileSettings(snap.data());
      } catch (_) {}

      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
      const unsub = onSnapshot(q, (snap) => {
        const all = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id, ...data,
            createdAt:
              data.createdAt?.toDate?.()?.getTime?.() ||
              (data.createdAt?._seconds ? data.createdAt._seconds * 1000 : data.createdAt) ||
              Date.now(),
          };
        }).filter((p: any) => p.moderationStatus !== 'removed');
        setLatestPosts(all);
        setTotalViews(all.reduce((s: number, p: any) => s + (p.viewsCount || 0), 0));
        setTotalReactions(all.reduce((s: number, p: any) => s + (p.reactionsCount || 0), 0));
        setLoading(false);
      }, () => setLoading(false));
      return unsub;
    };
    let unsub: (() => void) | undefined;
    fetchData().then(u => { unsub = u; });
    return () => { if (unsub) unsub(); };
  }, []);

  /* derived slices */
  const featured    = latestPosts[0];
  const secondary   = latestPosts.slice(1, 3);
  const listCards   = latestPosts.slice(3, 7);
  const moreStories = latestPosts.slice(4, 13);
  const trending    = [...latestPosts]
    .sort((a: any, b: any) =>
      ((b.viewsCount || 0) + (b.reactionsCount || 0) * 2) -
      ((a.viewsCount || 0) + (a.reactionsCount || 0) * 2)
    )
    .slice(0, 6);

  /* ticker */
  const _customItems: string[] = profileSettings?.tickerItems || [];
  const tickerEntries: string[] =
    profileSettings?.tickerMode === 'custom' && _customItems.length > 0
      ? _customItems
      : latestPosts.length > 0
        ? latestPosts.slice(0, 8).map((p: any) => p.title)
        : ["Voice of the Real Majority", "CJP Media — Unfiltered", "Stay Awake. Stay Janta."];

  return (
    <>
      <Helmet>
        <title>CJP Media — Voice of the Real Majority</title>
        <meta name="description" content="The official media wing of the Cockroach Janta Party. Unfiltered political satire, roasts, and news." />
        <meta property="og:title" content="CJP Media — Voice of the Real Majority" />
        <meta property="og:description" content="Unfiltered political satire, roasts, and news. Voice of the Real Majority." />
        <meta property="og:image" content="/opengraph.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="flex flex-col bg-[#050505] min-h-screen overflow-x-hidden pb-24 sm:pb-0">

        <Header settings={profileSettings} />

        {/* ── TICKER ── */}
        <div className="w-full bg-[#070707] border-b border-white/[0.04] h-9 flex items-center overflow-hidden">
          <div className="shrink-0 bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-[0.2em] px-4 h-full flex items-center gap-1.5 z-10 whitespace-nowrap select-none">
            <Radio className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" /> LIVE
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#070707] to-transparent z-10 pointer-events-none" />
            <div className="flex animate-marquee whitespace-nowrap">
              {[0, 1].map(i => (
                <div key={i} className="flex items-center gap-8 text-white/30 text-[11px] font-medium px-5 shrink-0">
                  {tickerEntries.map((text, idx) => (
                    <span key={idx} className="flex items-center gap-2.5 shrink-0">
                      <span className="w-[4px] h-[4px] rounded-full bg-[#ccff00]/60 shrink-0" />
                      {text}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="relative w-full overflow-hidden pt-10 sm:pt-14 pb-10">
          {/* ambient glows */}
          <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-[#ccff00]/[0.028] rounded-full blur-[140px] translate-x-1/3 -translate-y-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-[#ff4500]/[0.018] rounded-full blur-[120px] -translate-x-1/4 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">

              {/* ── Left: copy ── */}
              <div className="flex flex-col items-start">

                {/* live pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] mb-7 select-none">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ccff00]" />
                  </span>
                  <span className="text-white/45 text-[11px] font-semibold uppercase tracking-[0.18em]">
                    {latestPosts.length > 0 ? `${latestPosts.length} Stories Live` : "Voice of the Majority"}
                  </span>
                </div>

                {/* headline */}
                <h1 className="text-[52px] sm:text-[68px] lg:text-[80px] font-black text-white tracking-[-3px] leading-[0.87] mb-6">
                  Voice<br />of the<br /><span className="text-[#ccff00]">Real<br />Majority.</span>
                </h1>

                {/* tagline */}
                <p className="text-[13px] sm:text-[14px] text-white/35 max-w-[360px] leading-[1.95] mb-8">
                  The official media wing of the Cockroach Janta Party — unfiltered satire, roasts, and the news they don't want you to see.
                </p>

                {/* CTAs */}
                <div className="flex items-center gap-3 flex-wrap mb-9">
                  <Link
                    href="/feed"
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-[#ccff00] text-black font-black text-[13px] rounded-full hover:bg-white transition-all shadow-[0_0_32px_rgba(204,255,0,0.25)] active:scale-[0.97]"
                  >
                    Enter the Feed
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/category/Trending"
                    className="inline-flex items-center gap-2 px-5 py-3 border border-white/[0.1] text-white/50 font-semibold text-[13px] rounded-full hover:bg-white/[0.05] hover:border-white/[0.2] hover:text-white/80 transition-all active:scale-[0.97]"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-[#ff4500]" strokeWidth={2} aria-hidden="true" />
                    Trending
                  </Link>
                </div>

                {/* stats strip */}
                <div className="grid grid-cols-4 gap-4 pt-6 border-t border-white/[0.05] w-full">
                  {[
                    { value: latestPosts.length || "—", label: "Stories" },
                    { value: totalViews  > 0 ? fmtNum(totalViews) : "—",       label: "Views" },
                    { value: totalReactions > 0 ? fmtNum(totalReactions) : "—", label: "Reactions", accent: true },
                    { value: "12.7K+",  label: "Supporters" },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <span className={`font-black text-[20px] sm:text-[22px] leading-none tabular-nums ${s.accent ? "text-[#ccff00]" : "text-white"}`}>
                        {s.value}
                      </span>
                      <span className="text-white/22 text-[10px] font-semibold uppercase tracking-[0.1em]">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right: featured post card ── */}
              <div className="hidden lg:block">
                {featured ? (
                  <Link
                    href={`/post/${featured.id}`}
                    className="group block relative rounded-3xl overflow-hidden border border-white/[0.07] hover:border-white/[0.22] transition-all duration-500 shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
                    style={{ height: 520 }}
                  >
                    {getImg(featured) ? (
                      <img
                        src={getImg(featured)}
                        alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#0d0d0d] flex items-center justify-center">
                        <Flame className="w-12 h-12 text-[#ccff00]/10" />
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.48) 42%, rgba(0,0,0,0.04) 100%)" }} />

                    {/* top badges */}
                    <div className="absolute top-5 left-5 flex gap-2 z-10">
                      <span className="bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-[0.14em] px-3 py-1.5 rounded-full">
                        Featured
                      </span>
                      {featured.category && (
                        <span className="bg-black/55 backdrop-blur-sm border border-white/[0.1] text-white/55 text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full">
                          {featured.category}
                        </span>
                      )}
                    </div>

                    {/* bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
                      <div className="flex items-center gap-2 mb-3">
                        {profileSettings?.avatarUrl ? (
                          <img src={profileSettings.avatarUrl} alt={profileSettings?.name || "CJP Media"} className="w-5 h-5 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#ccff00]/10 flex items-center justify-center border border-[#ccff00]/20">
                            <Flame className="w-2.5 h-2.5 text-[#ccff00]" />
                          </div>
                        )}
                        <span className="text-white/40 text-[11px] font-medium flex items-center gap-1">
                          {profileSettings?.name || "CJP Media"}
                          <VerifiedBadge className="w-3 h-3" />
                        </span>
                      </div>
                      <h3 className="text-white font-black text-[22px] leading-[1.18] mb-4 group-hover:text-[#ccff00] transition-colors duration-300 line-clamp-3">
                        {featured.title}
                      </h3>
                      <div className="flex items-center gap-4 text-white/28 text-[11px] font-medium">
                        <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(featured.viewsCount || 0)}</span>
                        <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(featured.reactionsCount || 0)}</span>
                        <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />{featured.commentsCount || 0}</span>
                        <span className="ml-auto flex items-center gap-1 text-white/20"><Clock className="w-3 h-3" />{ago(featured.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ) : !loading ? (
                  <div className="rounded-3xl bg-[#0a0a0a] border border-white/[0.04] flex items-center justify-center" style={{ height: 520 }}>
                    <Newspaper className="w-9 h-9 text-white/[0.04]" strokeWidth={1.5} />
                  </div>
                ) : (
                  <div className="rounded-3xl bg-[#0a0a0a] border border-white/[0.04] animate-pulse" style={{ height: 520 }} />
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <div className="border-y border-white/[0.04] bg-[#030303]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
            <div className="relative">
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#030303] to-transparent z-10 pointer-events-none" />
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
                {CATEGORIES.map(({ href, label, Icon, color, bg }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-transparent hover:border-white/[0.1] transition-all whitespace-nowrap shrink-0"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} strokeWidth={2} aria-hidden="true" />
                    <span className="text-white/60 group-hover:text-white/90 text-[12px] font-bold transition-colors">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── LATEST STORIES ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-9 pb-9 w-full">
          <SectionTitle accent="#ccff00" href="/feed">Latest Stories</SectionTitle>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <Skeleton className="lg:col-span-8 min-h-[400px]" />
              <div className="lg:col-span-4 flex flex-col gap-4">
                <Skeleton className="min-h-[190px]" />
                <Skeleton className="min-h-[190px]" />
              </div>
            </div>
          ) : latestPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Newspaper className="w-9 h-9 text-white/[0.06]" strokeWidth={1.5} />
              <p className="text-white/20 text-[14px]">No stories yet. Check back soon.</p>
              <Link href="/feed" className="text-[#ccff00] font-bold text-[13px] hover:underline">Go to Feed</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Row 1: hero + 2 stacked */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {featured && (
                  <div className="lg:col-span-8">
                    <HeroCard post={featured} />
                  </div>
                )}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  {secondary.map(p => <MedCard key={p.id} post={p} tall />)}
                </div>
              </div>

              {/* Row 2: 4 compact cards */}
              {listCards.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {listCards.map((p, i) => <SmCard key={p.id} post={p} rank={i + 1} />)}
                </div>
              )}
            </div>
          )}
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="border-t border-white/[0.04]" />
        </div>

        {/* ── TRENDING ── */}
        {trending.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-9 pb-9 w-full">
            <SectionTitle accent="#ff4500" href="/category/Trending" badge="HOT">Trending Now</SectionTitle>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* #1 big card */}
              <Link
                href={`/post/${trending[0].id}`}
                className="lg:col-span-5 group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#ff4500]/35 transition-all duration-400 block cursor-pointer"
                style={{ minHeight: 320 }}
              >
                {getImg(trending[0]) ? (
                  <img src={getImg(trending[0])} alt={trending[0].title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-[#0d0d0d]" />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.04) 100%)" }} />
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#ff4500] text-white text-[10px] font-black uppercase tracking-[0.12em] px-3 py-1.5 rounded-full">#1 Trending</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  {trending[0].category && (
                    <span className="text-[#ff4500]/65 text-[10px] font-bold uppercase tracking-[0.14em] block mb-1.5">{trending[0].category}</span>
                  )}
                  <h3 className="text-white font-black text-[18px] sm:text-[20px] leading-tight mb-3 group-hover:text-[#ccff00] transition-colors line-clamp-3">
                    {trending[0].title}
                  </h3>
                  <div className="flex items-center gap-3 text-white/28 text-[11px] font-medium">
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(trending[0].viewsCount || 0)}</span>
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(trending[0].reactionsCount || 0)}</span>
                  </div>
                </div>
              </Link>

              {/* #2–6 ranked list */}
              <div className="lg:col-span-7 flex flex-col divide-y divide-white/[0.04]">
                {trending.slice(1, 6).map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="group flex gap-3.5 py-3.5 hover:bg-white/[0.02] rounded-xl px-2 -mx-2 transition-colors cursor-pointer items-center first:pt-0 last:pb-0"
                  >
                    <span className="text-[24px] font-black text-white/[0.12] w-7 shrink-0 text-center leading-none tabular-nums group-hover:text-[#ff4500]/45 transition-colors">
                      {i + 2}
                    </span>
                    <div className="w-[64px] h-[50px] rounded-lg overflow-hidden shrink-0 relative bg-[#0d0d0d]">
                      {getImg(post) && (
                        <img src={getImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      {post.category && (
                        <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.14em] mb-0.5">{post.category}</span>
                      )}
                      <h3 className="text-white font-semibold text-[13px] leading-snug group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-white/18 text-[10px]">
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{fmtNum(post.viewsCount || 0)}</span>
                        <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/[0.08] group-hover:text-[#ccff00]/45 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── MORE STORIES ── */}
        {moreStories.length > 0 && (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="border-t border-white/[0.04]" />
            </div>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-9 pb-9 w-full">
              <SectionTitle accent="#a855f7" href="/feed">More Stories</SectionTitle>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* main list */}
                <div className="flex flex-col divide-y divide-white/[0.04]">
                  {moreStories.slice(0, 6).map((post, i) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="group flex gap-4 py-4 hover:bg-white/[0.018] rounded-xl px-2 -mx-2 transition-colors cursor-pointer items-center"
                    >
                      <span className="text-[11px] font-black text-white/12 w-4 shrink-0 text-right tabular-nums group-hover:text-white/25 transition-colors">{i + 1}</span>
                      <div className="w-[80px] h-[60px] rounded-xl overflow-hidden shrink-0 relative bg-[#0d0d0d]">
                        {getImg(post) && (
                          <img src={getImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {post.category && (
                            <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.12em]">{post.category}</span>
                          )}
                          <span className="text-white/12 text-[10px]">·</span>
                          <span className="text-white/18 text-[10px]">{ago(post.createdAt)}</span>
                        </div>
                        <h3 className="text-white font-semibold text-[13px] leading-snug mb-1.5 group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
                        <div className="flex items-center gap-3 text-white/18 text-[10px]">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount || 0)}</span>
                          <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.commentsCount || 0}</span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-white/[0.07] group-hover:text-[#ccff00]/45 transition-colors shrink-0" />
                    </Link>
                  ))}

                  <Link
                    href="/feed"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-white/[0.07] text-white/35 font-bold text-[13px] hover:border-[#ccff00]/25 hover:text-[#ccff00]/65 hover:bg-[#ccff00]/[0.04] transition-all"
                  >
                    Load more stories <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>

                {/* sidebar: more posts as small cards */}
                <div className="hidden lg:flex flex-col gap-3">
                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.16em] mb-1">Also in the feed</p>
                  {moreStories.slice(6, 9).map(p => (
                    <Link
                      key={p.id}
                      href={`/post/${p.id}`}
                      className="group relative rounded-xl overflow-hidden border border-white/[0.05] hover:border-white/[0.14] transition-all block"
                      style={{ height: 128 }}
                    >
                      {getImg(p) ? (
                        <img src={getImg(p)} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 bg-[#0d0d0d]" />
                      )}
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }} />
                      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                        <h3 className="text-white font-bold text-[12px] leading-snug group-hover:text-[#ccff00] transition-colors line-clamp-2">{p.title}</h3>
                      </div>
                    </Link>
                  ))}
                  {/* bookmark CTA */}
                  <div className="mt-1 p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.05] flex flex-col gap-2">
                    <Bookmark className="w-5 h-5 text-[#ccff00]/60" aria-hidden="true" />
                    <p className="text-white/55 text-[12px] font-semibold leading-snug">Save stories to your reading list.</p>
                    <Link href="/feed" className="text-[#ccff00] text-[11px] font-bold hover:underline">Browse the feed →</Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── CTA BANNER ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          <div className="relative overflow-hidden bg-[#ccff00] rounded-2xl px-7 py-9 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* decorative noise */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div>
              <h3 className="relative text-black font-black text-[26px] sm:text-[30px] tracking-tight leading-tight mb-1.5">
                Stay Unfiltered.
              </h3>
              <p className="relative text-black/50 text-[13px] font-medium">Join 12.7K+ supporters. Real stories. No corporate filter.</p>
            </div>
            <div className="relative flex items-center gap-3 shrink-0 flex-wrap">
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-black text-[13px] rounded-full hover:bg-[#0d0d0d] active:scale-[0.97] transition-all whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
              >
                <Flame className="w-3.5 h-3.5 text-[#ccff00]" strokeWidth={2.5} aria-hidden="true" />
                Enter the Feed
              </Link>
              <Link
                href="/category/Trending"
                className="inline-flex items-center gap-2 px-5 py-3 bg-black/[0.08] border border-black/[0.12] text-black/75 font-bold text-[13px] rounded-full hover:bg-black/[0.16] active:scale-[0.97] transition-all whitespace-nowrap"
              >
                <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                Trending
              </Link>
            </div>
          </div>
        </div>

        <Footer settings={profileSettings} />
        <BottomNav />
      </div>
    </>
  );
}
