import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { collection, query, orderBy, limit, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  Flame, ArrowRight, TrendingUp, Newspaper, Eye,
  ChevronRight, Megaphone, Zap, Clock,
  MessageCircle, ArrowUpRight, Radio, Mic2, Landmark,
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
  { href: "/category/Trending",    label: "Trending",    Icon: TrendingUp, color: "#ff4500" },
  { href: "/category/Politics",    label: "Politics",    Icon: Landmark,   color: "#1d9bf0" },
  { href: "/category/Satire",      label: "Satire",      Icon: Mic2,       color: "#ccff00" },
  { href: "/category/Youth Voice", label: "Youth Voice", Icon: Megaphone,  color: "#a855f7" },
  { href: "/category/Breaking",    label: "Breaking",    Icon: Zap,        color: "#f59e0b" },
  { href: "/feed",                 label: "All Posts",   Icon: Newspaper,  color: "#00ba7c" },
];

/* ─── shared components ─── */
function SectionTitle({
  accent, children, href,
}: { accent: string; children: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-[3px] h-[18px] rounded-full" style={{ backgroundColor: accent }} />
        <h2 className="text-white font-bold text-[16px] sm:text-[18px] tracking-tight">{children}</h2>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-white/25 hover:text-[#ccff00] text-[12px] font-medium transition-colors">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#0d0d0d] border border-white/[0.04] overflow-hidden animate-pulse ${className}`}>
      <div className="aspect-video bg-white/[0.03]" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-2 bg-white/[0.03] rounded-full w-1/4" />
        <div className="h-3.5 bg-white/[0.03] rounded-full w-full" />
        <div className="h-3.5 bg-white/[0.03] rounded-full w-2/3" />
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
      className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.16] transition-all duration-300 block cursor-pointer"
      style={{ minHeight: 360 }}
    >
      {img ? (
        <img src={img} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-700" />
      ) : (
        <div className="absolute inset-0 bg-[#0d0d0d] flex items-center justify-center">
          <Flame className="w-10 h-10 text-white/5" />
        </div>
      )}
      {/* layered gradient: bottom heavy for text, top slight for badge area */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.08) 70%, transparent 100%)" }} />

      {post.category && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-[0.12em] px-3 py-1.5 rounded-full">
            {post.category}
          </span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7 z-10">
        <h3 className="text-white font-black text-[19px] sm:text-[24px] leading-[1.18] mb-3 group-hover:text-[#ccff00] transition-colors duration-300 line-clamp-3">
          {post.title}
        </h3>
        {post.roast && (
          <p className="text-white/35 text-[12px] italic line-clamp-1 mb-3">{post.roast}</p>
        )}
        <div className="flex items-center gap-4 text-white/35 text-[11px] font-medium">
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
function MedCard({ post }: { post: any }) {
  const img = getImg(post);
  return (
    <Link
      href={`/post/${post.id}`}
      className="group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.14] transition-all duration-300 flex flex-col cursor-pointer"
      style={{ minHeight: 160 }}
    >
      {img ? (
        <img src={img} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
      ) : (
        <div className="absolute inset-0 bg-[#0d0d0d]" />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 100%)" }} />

      {post.category && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-black/55 backdrop-blur-sm border border-white/[0.08] text-white/55 text-[9px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full">
            {post.category}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
        <h3 className="text-white font-bold text-[13px] leading-snug mb-1.5 group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
        <div className="flex items-center gap-2.5 text-white/30 text-[10px]">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount || 0)}</span>
          <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
          <span className="ml-auto text-white/20">{ago(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

/* ─── card: compact horizontal ─── */
function SmCard({ post }: { post: any }) {
  const img = getImg(post);
  return (
    <Link
      href={`/post/${post.id}`}
      className="group flex gap-3 rounded-xl border border-white/[0.05] hover:border-white/[0.10] hover:bg-white/[0.012] transition-all p-3 cursor-pointer items-center"
    >
      <div className="w-[68px] h-[52px] rounded-lg overflow-hidden shrink-0 relative bg-[#0d0d0d]">
        {img && <img src={img} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        {post.category && (
          <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.14em] mb-0.5">{post.category}</span>
        )}
        <h3 className="text-white font-semibold text-[13px] leading-tight group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
        <div className="flex items-center gap-2 mt-1 text-white/25 text-[10px]">
          <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{fmtNum(post.viewsCount || 0)}</span>
          <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
          <span className="ml-auto">{ago(post.createdAt)}</span>
        </div>
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 text-white/[0.08] group-hover:text-[#ccff00]/50 transition-colors shrink-0" />
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
        });
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

  /* derived slices — generous overlaps so sections never go empty */
  const featured    = latestPosts[0];
  const secondary   = latestPosts.slice(1, 3);
  const listCards   = latestPosts.slice(3, 7);
  const moreStories = latestPosts.slice(4, 12);          // starts at 4 so it's visible sooner
  const trending    = [...latestPosts]
    .sort((a: any, b: any) =>
      ((b.viewsCount || 0) + (b.reactionsCount || 0) * 2) -
      ((a.viewsCount || 0) + (a.reactionsCount || 0) * 2)
    )
    .slice(0, 5);

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
        <div className="w-full bg-[#080808] border-b border-white/[0.04] h-9 flex items-center overflow-hidden">
          <div className="shrink-0 bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-[0.2em] px-4 h-full flex items-center gap-1.5 z-10 whitespace-nowrap select-none">
            <Radio className="w-3 h-3" strokeWidth={2.5} /> LIVE
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex w-[200%] animate-marquee whitespace-nowrap">
              {[0, 1].map(i => (
                <div key={i} className="flex-1 flex items-center gap-8 text-white/30 text-[11px] font-medium px-5">
                  {latestPosts.length > 0
                    ? latestPosts.slice(0, 8).map((p, idx) => (
                        <span key={idx} className="flex items-center gap-2 shrink-0">
                          <span className="w-[5px] h-[5px] rounded-full bg-[#ccff00]/70 shrink-0" />
                          {p.title}
                        </span>
                      ))
                    : (
                      <>
                        {["Voice of the Real Majority", "CJP Media — Unfiltered", "Stay Awake. Stay Janta."].map((t, idx) => (
                          <span key={idx} className="flex items-center gap-2 shrink-0">
                            <span className="w-[5px] h-[5px] rounded-full bg-[#ccff00]/70" />
                            {t}
                          </span>
                        ))}
                      </>
                    )
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="relative w-full overflow-hidden pt-8 sm:pt-12 pb-8">
          {/* ambient glow — right side only */}
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#ccff00]/[0.035] rounded-full blur-[120px] translate-x-1/3 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">

              {/* ── Left: copy ── */}
              <div className="flex flex-col items-start">

                {/* live pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] mb-6 select-none">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ccff00]" />
                  </span>
                  <span className="text-white/45 text-[11px] font-semibold uppercase tracking-[0.18em]">
                    {latestPosts.length > 0 ? `${latestPosts.length} Stories Live` : "Voice of the Majority"}
                  </span>
                </div>

                {/* headline */}
                <h1 className="text-[48px] sm:text-[62px] lg:text-[74px] font-black text-white tracking-[-2.5px] leading-[0.88] mb-5">
                  Voice<br />of the<br /><span className="text-[#ccff00]">Real<br />Majority.</span>
                </h1>

                {/* tagline */}
                <p className="text-[13px] sm:text-[14px] text-white/35 max-w-[340px] leading-[1.9] mb-7">
                  The official media wing of the Cockroach Janta Party — unfiltered satire, roasts, and the news they don't want you to see.
                </p>

                {/* CTAs */}
                <div className="flex items-center gap-2.5 flex-wrap mb-8">
                  <Link
                    href="/feed"
                    className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#ccff00] text-black font-bold text-[13px] rounded-full hover:bg-white transition-all shadow-[0_0_24px_rgba(204,255,0,0.18)]"
                  >
                    Enter the Feed
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/category/Trending"
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/[0.08] text-white/50 font-medium text-[13px] rounded-full hover:bg-white/[0.04] hover:border-white/[0.15] hover:text-white/80 transition-all"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-[#ccff00]" strokeWidth={2} />
                    Trending
                  </Link>
                </div>

                {/* stats strip */}
                <div className="flex items-center gap-6 pt-5 border-t border-white/[0.05] w-full">
                  {[
                    { value: latestPosts.length || "—", label: "Posts", accent: false },
                    { value: totalViews  > 0 ? fmtNum(totalViews)     : "—", label: "Views",     accent: false },
                    { value: totalReactions > 0 ? fmtNum(totalReactions) : "—", label: "Reactions", accent: true  },
                    { value: "12.7K+",  label: "Supporters", accent: false },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                      <span className={`font-black text-[18px] leading-none tabular-nums ${s.accent ? "text-[#ccff00]" : "text-white"}`}>
                        {s.value}
                      </span>
                      <span className="text-white/25 text-[10px] font-medium">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right: featured post card (desktop only) ── */}
              <div className="hidden lg:block">
                {featured ? (
                  <Link
                    href={`/post/${featured.id}`}
                    className="group block relative rounded-3xl overflow-hidden border border-white/[0.07] hover:border-white/[0.16] transition-all duration-500 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
                    style={{ height: 480 }}
                  >
                    {getImg(featured) ? (
                      <img
                        src={getImg(featured)}
                        alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#0d0d0d] flex items-center justify-center">
                        <Flame className="w-10 h-10 text-[#ccff00]/15" />
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.06) 100%)" }} />

                    {/* badges */}
                    <div className="absolute top-5 left-5 flex gap-2 z-10">
                      <span className="bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-[0.14em] px-3 py-1.5 rounded-full">
                        Featured
                      </span>
                      {featured.category && (
                        <span className="bg-black/50 backdrop-blur-sm border border-white/[0.09] text-white/60 text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full">
                          {featured.category}
                        </span>
                      )}
                    </div>

                    {/* bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        {profileSettings?.avatarUrl ? (
                          <img src={profileSettings.avatarUrl} alt="" className="w-[18px] h-[18px] rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-[18px] h-[18px] rounded-full bg-[#ccff00]/10 flex items-center justify-center">
                            <Flame className="w-2.5 h-2.5 text-[#ccff00]" />
                          </div>
                        )}
                        <span className="text-white/45 text-[11px] font-medium flex items-center gap-1">
                          {profileSettings?.name || "CJP Media"}
                          <VerifiedBadge className="w-3 h-3" />
                        </span>
                      </div>
                      <h3 className="text-white font-black text-[20px] leading-[1.2] mb-4 group-hover:text-[#ccff00] transition-colors duration-300 line-clamp-3">
                        {featured.title}
                      </h3>
                      <div className="flex items-center gap-4 text-white/30 text-[11px]">
                        <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" />{fmtNum(featured.viewsCount || 0)}</span>
                        <span className="flex items-center gap-1.5"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(featured.reactionsCount || 0)}</span>
                        <span className="ml-auto flex items-center gap-1 text-white/20"><Clock className="w-3 h-3" />{ago(featured.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ) : !loading ? (
                  <div className="rounded-3xl bg-[#0a0a0a] border border-white/[0.04] flex items-center justify-center" style={{ height: 480 }}>
                    <Newspaper className="w-8 h-8 text-white/5" strokeWidth={1.5} />
                  </div>
                ) : (
                  <div className="rounded-3xl bg-[#0a0a0a] border border-white/[0.04] animate-pulse" style={{ height: 480 }} />
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── TOPICS ── */}
        <div className="border-t border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
              {CATEGORIES.map(({ href, label, Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.07] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/[0.13] transition-all whitespace-nowrap shrink-0"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 transition-colors" style={{ color }} strokeWidth={2} />
                  <span className="text-white/55 group-hover:text-white/85 text-[12px] font-semibold transition-colors">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── LATEST STORIES ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 w-full">
          <SectionTitle accent="#ccff00" href="/feed">Latest Stories</SectionTitle>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <Skeleton className="lg:col-span-8" />
              <div className="lg:col-span-4 flex flex-col gap-4">
                <Skeleton />
                <Skeleton />
              </div>
            </div>
          ) : latestPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Newspaper className="w-8 h-8 text-white/8" strokeWidth={1.5} />
              <p className="text-white/20 text-[13px]">No stories yet. Check back soon.</p>
              <Link href="/feed" className="text-[#ccff00] font-semibold text-[13px] hover:underline">Go to Feed</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Row 1: hero (8 cols) + 2 stacked (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {featured && (
                  <div className="lg:col-span-8">
                    <HeroCard post={featured} />
                  </div>
                )}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  {secondary.map(p => <MedCard key={p.id} post={p} />)}
                </div>
              </div>

              {/* Row 2: 4 compact horizontal */}
              {listCards.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {listCards.map(p => <SmCard key={p.id} post={p} />)}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── divider ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="border-t border-white/[0.04]" />
        </div>

        {/* ── TRENDING ── */}
        {trending.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 w-full">
            <SectionTitle accent="#ff4500" href="/category/Trending">Trending Now</SectionTitle>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* #1 big card */}
              <Link
                href={`/post/${trending[0].id}`}
                className="lg:col-span-6 group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#ff4500]/25 transition-all duration-300 block cursor-pointer"
                style={{ minHeight: 300 }}
              >
                {getImg(trending[0]) ? (
                  <img src={getImg(trending[0])} alt={trending[0].title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.025] transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-[#0d0d0d]" />
                )}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.06) 100%)" }} />
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#ff4500] text-white text-[10px] font-black uppercase tracking-[0.12em] px-3 py-1.5 rounded-full">#1 Trending</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  {trending[0].category && (
                    <span className="text-[#ff4500]/70 text-[10px] font-bold uppercase tracking-[0.14em] block mb-1.5">{trending[0].category}</span>
                  )}
                  <h3 className="text-white font-black text-[18px] sm:text-[21px] leading-tight mb-3 group-hover:text-[#ccff00] transition-colors line-clamp-3">
                    {trending[0].title}
                  </h3>
                  <div className="flex items-center gap-3 text-white/30 text-[11px]">
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(trending[0].viewsCount || 0)}</span>
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(trending[0].reactionsCount || 0)}</span>
                  </div>
                </div>
              </Link>

              {/* #2–5 ranked list */}
              <div className="lg:col-span-6 flex flex-col divide-y divide-white/[0.04]">
                {trending.slice(1, 5).map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="group flex gap-3 py-3.5 hover:bg-white/[0.01] rounded-xl px-2 -mx-2 transition-colors cursor-pointer items-center first:pt-0 last:pb-0"
                  >
                    <span className="text-[22px] font-black text-white/20 w-7 shrink-0 text-center leading-none tabular-nums">
                      {i + 2}
                    </span>
                    <div className="w-[60px] h-[48px] rounded-lg overflow-hidden shrink-0 relative bg-[#0d0d0d]">
                      {getImg(post) && (
                        <img src={getImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      {post.category && (
                        <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.14em] mb-0.5">{post.category}</span>
                      )}
                      <h3 className="text-white font-semibold text-[13px] leading-tight group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-white/20 text-[10px]">
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{fmtNum(post.viewsCount || 0)}</span>
                        <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/[0.07] group-hover:text-[#ccff00]/40 transition-colors shrink-0" />
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
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 w-full">
              <SectionTitle accent="#a855f7" href="/feed">More Stories</SectionTitle>

              <div className="flex flex-col divide-y divide-white/[0.04]">
                {moreStories.map((post, i) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="group flex gap-4 py-4 hover:bg-white/[0.01] rounded-xl px-2 -mx-2 transition-colors cursor-pointer items-center"
                  >
                    <span className="text-[11px] font-black text-white/15 w-4 shrink-0 text-right tabular-nums">{i + 1}</span>
                    <div className="w-[76px] h-[56px] rounded-xl overflow-hidden shrink-0 relative bg-[#0d0d0d]">
                      {getImg(post) && (
                        <img src={getImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {post.category && (
                          <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.12em]">{post.category}</span>
                        )}
                        <span className="text-white/15 text-[10px]">·</span>
                        <span className="text-white/15 text-[10px]">{ago(post.createdAt)}</span>
                      </div>
                      <h3 className="text-white font-semibold text-[13px] leading-snug mb-1.5 group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
                      <div className="flex items-center gap-3 text-white/20 text-[10px]">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount || 0)}</span>
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.commentsCount || 0}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/[0.07] group-hover:text-[#ccff00]/40 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>

              <Link
                href="/feed"
                className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/[0.06] text-white/35 font-medium text-[12px] hover:border-white/[0.12] hover:text-white/60 transition-all"
              >
                Load more stories <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </section>
          </>
        )}

        {/* ── CTA BANNER ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          <div className="bg-[#ccff00] rounded-2xl px-7 py-8 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <h3 className="text-black font-black text-[22px] sm:text-[26px] tracking-tight leading-tight mb-1">
                Stay Unfiltered.
              </h3>
              <p className="text-black/50 text-[13px]">Join 12.7K+ supporters. Real stories. No corporate filter.</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white font-bold text-[13px] rounded-full hover:bg-[#111] transition-all whitespace-nowrap"
              >
                <Flame className="w-3.5 h-3.5 text-[#ccff00]" strokeWidth={2.5} />
                Enter the Feed
              </Link>
              <Link
                href="/category/Trending"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black/[0.08] border border-black/[0.12] text-black/75 font-bold text-[13px] rounded-full hover:bg-black/[0.16] transition-all whitespace-nowrap"
              >
                <TrendingUp className="w-3.5 h-3.5" />
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
