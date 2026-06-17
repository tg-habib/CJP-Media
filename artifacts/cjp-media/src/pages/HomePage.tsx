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

const CATEGORIES = [
  { href: "/category/Trending",    label: "Trending",    Icon: TrendingUp, color: "#ff4500" },
  { href: "/category/Politics",    label: "Politics",    Icon: Landmark,   color: "#1d9bf0" },
  { href: "/category/Satire",      label: "Satire",      Icon: Mic2,       color: "#ccff00" },
  { href: "/category/Youth Voice", label: "Youth Voice", Icon: Megaphone,  color: "#a855f7" },
  { href: "/category/Breaking",    label: "Breaking",    Icon: Zap,        color: "#f59e0b" },
  { href: "/feed",                 label: "All Posts",   Icon: Newspaper,  color: "#00ba7c" },
];

function SectionTitle({ accent, children, href }: { accent: string; children: React.ReactNode; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-[3px] h-5 rounded-full" style={{ backgroundColor: accent }} />
        <h2 className="text-white font-bold text-[17px] sm:text-[19px] tracking-tight">{children}</h2>
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-white/30 hover:text-[#ccff00] text-[12px] font-medium transition-colors">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#0e0e0e] border border-white/[0.05] overflow-hidden animate-pulse ${className}`}>
      <div className="aspect-video bg-white/[0.04]" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-2 bg-white/[0.04] rounded-full w-1/4" />
        <div className="h-3.5 bg-white/[0.04] rounded-full w-full" />
        <div className="h-3.5 bg-white/[0.04] rounded-full w-2/3" />
      </div>
    </div>
  );
}

function PostCard({ post, size = "md" }: { post: any; size?: "hero" | "md" | "sm" }) {
  const img = getImg(post);

  if (size === "hero") {
    return (
      <Link
        href={`/post/${post.id}`}
        className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.14] transition-all duration-300 block cursor-pointer"
        style={{ minHeight: 380 }}
      >
        {img ? (
          <img src={img} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 bg-[#0e0e0e] flex items-center justify-center">
            <Flame className="w-12 h-12 text-white/5" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/97 via-black/30 to-transparent" />

        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <span className="bg-black/60 backdrop-blur border border-white/10 text-white/70 text-[10px] font-semibold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-full" /> Latest
          </span>
          {post.category && (
            <span className="bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-full">
              {post.category}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
          <h3 className="text-white font-black text-[20px] sm:text-[26px] leading-[1.18] mb-3 group-hover:text-[#ccff00] transition-colors duration-300">
            {post.title}
          </h3>
          {post.roast && (
            <p className="text-white/40 text-[13px] italic line-clamp-1 mb-3">{post.roast}</p>
          )}
          <div className="flex items-center gap-4 text-white/35 text-[11px] font-medium">
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(post.viewsCount || 0)}</span>
            <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
            <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />{post.commentsCount || 0}</span>
            <span className="ml-auto flex items-center gap-1 text-white/25"><Clock className="w-3 h-3" />{ago(post.createdAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (size === "sm") {
    return (
      <Link href={`/post/${post.id}`} className="group flex gap-3 rounded-xl border border-white/[0.05] hover:border-white/[0.10] hover:bg-white/[0.015] transition-all p-3 cursor-pointer items-center">
        <div className="w-[72px] h-[56px] rounded-lg overflow-hidden shrink-0 relative bg-[#0e0e0e]">
          {img && <img src={img} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          {post.category && <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.14em] mb-0.5">{post.category}</span>}
          <h3 className="text-white font-semibold text-[13px] leading-tight group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-white/25 text-[10px] font-medium">
            <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{fmtNum(post.viewsCount || 0)}</span>
            <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
            <span className="ml-auto">{ago(post.createdAt)}</span>
          </div>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-white/10 group-hover:text-[#ccff00]/50 transition-colors shrink-0" />
      </Link>
    );
  }

  // md — stacked card
  return (
    <Link href={`/post/${post.id}`} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.14] transition-all duration-300 flex flex-col cursor-pointer" style={{ minHeight: 180 }}>
      {img ? (
        <img src={img} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 opacity-60" />
      ) : (
        <div className="absolute inset-0 bg-[#0e0e0e]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/97 via-black/50 to-transparent" />
      {post.category && (
        <div className="absolute top-3 left-3">
          <span className="bg-black/60 backdrop-blur border border-white/10 text-white/55 text-[10px] font-medium uppercase tracking-[0.1em] px-2.5 py-1 rounded-full">{post.category}</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="text-white font-bold text-[13px] leading-tight mb-2 group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
        <div className="flex items-center gap-3 text-white/30 text-[10px] font-medium">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount || 0)}</span>
          <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
          <span className="ml-auto">{ago(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

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

  const featured   = latestPosts[0];
  const secondary  = latestPosts.slice(1, 3);
  const listCards  = latestPosts.slice(3, 7);
  const moreStories= latestPosts.slice(7, 14);
  const trending   = [...latestPosts]
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
        <div className="w-full bg-[#0a0a0a] border-b border-white/[0.05] h-9 flex items-center overflow-hidden">
          <div className="shrink-0 bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-[0.18em] px-4 h-full flex items-center gap-1.5 z-10 whitespace-nowrap">
            <Radio className="w-3 h-3" strokeWidth={2.5} /> LIVE
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex w-[200%] animate-marquee whitespace-nowrap">
              {[0, 1].map(i => (
                <div key={i} className="flex-1 flex items-center gap-10 text-white/35 text-[11px] font-medium tracking-wide px-6">
                  {latestPosts.slice(0, 6).map((p, idx) => (
                    <span key={idx} className="flex items-center gap-2.5 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-[#ccff00] shrink-0" />
                      {p.title}
                    </span>
                  ))}
                  {latestPosts.length === 0 && (
                    <>
                      <span className="flex items-center gap-2.5 shrink-0"><span className="w-1 h-1 rounded-full bg-[#ccff00]" />Voice of the Real Majority</span>
                      <span className="flex items-center gap-2.5 shrink-0"><span className="w-1 h-1 rounded-full bg-[#ccff00]" />CJP Media — Unfiltered</span>
                      <span className="flex items-center gap-2.5 shrink-0"><span className="w-1 h-1 rounded-full bg-[#ccff00]" />Stay Awake. Stay Janta.</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="relative w-full overflow-hidden pt-10 sm:pt-14 pb-10">
          <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-[#ccff00]/[0.04] rounded-full blur-[140px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

              {/* Copy */}
              <div className="flex flex-col items-start">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-7">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ccff00]" />
                  </span>
                  <span className="text-white/50 text-[11px] font-semibold uppercase tracking-[0.16em]">
                    {latestPosts.length > 0 ? `${latestPosts.length} Stories Live` : "Voice of the Majority"}
                  </span>
                </div>

                <h1 className="text-[52px] sm:text-[68px] lg:text-[82px] font-black text-white tracking-[-3px] leading-[0.9] mb-6">
                  Voice<br />of the<br /><span className="text-[#ccff00]">Real<br />Majority.</span>
                </h1>

                <p className="text-[14px] sm:text-[15px] text-white/40 max-w-[360px] leading-[1.8] mb-8">
                  The official media wing of the Cockroach Janta Party — unfiltered satire, roasts, and the news they don't want you to see.
                </p>

                <div className="flex items-center gap-2.5 flex-wrap mb-10">
                  <Link href="/feed" className="group inline-flex items-center gap-2 px-6 py-3 bg-[#ccff00] text-black font-bold text-[13px] rounded-full hover:bg-white transition-all shadow-[0_0_30px_rgba(204,255,0,0.2)]">
                    Enter the Feed
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/category/Trending" className="inline-flex items-center gap-2 px-5 py-3 bg-transparent border border-white/10 text-white/60 font-medium text-[13px] rounded-full hover:bg-white/[0.04] hover:border-white/20 hover:text-white transition-all">
                    <TrendingUp className="w-3.5 h-3.5 text-[#ccff00]" strokeWidth={2} />
                    Trending
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-5 pt-6 border-t border-white/[0.06] w-full">
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-[15px] leading-none">{latestPosts.length || "—"}</span>
                    <span className="text-white/30 text-[10px] font-medium mt-0.5">Posts</span>
                  </div>
                  <div className="w-px h-6 bg-white/[0.07]" />
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-[15px] leading-none">{totalViews > 0 ? fmtNum(totalViews) : "—"}</span>
                    <span className="text-white/30 text-[10px] font-medium mt-0.5">Views</span>
                  </div>
                  <div className="w-px h-6 bg-white/[0.07]" />
                  <div className="flex flex-col">
                    <span className="text-[#ccff00] font-bold text-[15px] leading-none">{totalReactions > 0 ? fmtNum(totalReactions) : "—"}</span>
                    <span className="text-white/30 text-[10px] font-medium mt-0.5">Reactions</span>
                  </div>
                  <div className="w-px h-6 bg-white/[0.07]" />
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-[15px] leading-none">12.7K+</span>
                    <span className="text-white/30 text-[10px] font-medium mt-0.5">Supporters</span>
                  </div>
                </div>
              </div>

              {/* Featured post card — desktop only */}
              <div className="hidden lg:block">
                {featured ? (
                  <Link href={`/post/${featured.id}`} className="group block relative rounded-3xl overflow-hidden border border-white/[0.07] hover:border-white/[0.15] transition-all duration-500 shadow-[0_32px_80px_rgba(0,0,0,0.5)]" style={{ aspectRatio: "4/5" }}>
                    {getImg(featured) ? (
                      <img src={getImg(featured)} alt={featured.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    ) : (
                      <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
                        <Flame className="w-12 h-12 text-[#ccff00]/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/98 via-black/25 to-transparent" />

                    <div className="absolute top-5 left-5 flex gap-2">
                      <span className="bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-[0.14em] px-3 py-1.5 rounded-full">Featured</span>
                      {featured.category && (
                        <span className="bg-black/60 backdrop-blur text-white/70 text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-white/10">
                          {featured.category}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-7">
                      <div className="flex items-center gap-1.5 mb-3">
                        {profileSettings?.avatarUrl ? (
                          <img src={profileSettings.avatarUrl} alt="" className="w-4.5 h-4.5 rounded-full object-cover" />
                        ) : (
                          <Flame className="w-3.5 h-3.5 text-[#ccff00]" />
                        )}
                        <span className="text-white/50 text-[11px] font-medium flex items-center gap-1">
                          {profileSettings?.name || "CJP Media"}
                          <VerifiedBadge className="w-3 h-3" />
                        </span>
                      </div>
                      <h3 className="text-white font-black text-[20px] leading-[1.2] mb-4 group-hover:text-[#ccff00] transition-colors duration-300 line-clamp-3">
                        {featured.title}
                      </h3>
                      <div className="flex items-center gap-4 text-white/35 text-[11px]">
                        <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" />{fmtNum(featured.viewsCount || 0)}</span>
                        <span className="flex items-center gap-1.5"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(featured.reactionsCount || 0)}</span>
                        <span className="ml-auto text-white/25"><Clock className="w-3 h-3 inline mr-1" />{ago(featured.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ) : !loading ? (
                  <div className="rounded-3xl bg-[#0a0a0a] border border-white/[0.05] flex items-center justify-center" style={{ aspectRatio: "4/5" }}>
                    <Flame className="w-8 h-8 text-white/5" />
                  </div>
                ) : null}
              </div>

            </div>
          </div>
        </section>

        {/* ── BROWSE TOPICS ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            {CATEGORIES.map(({ href, label, Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14] transition-all whitespace-nowrap shrink-0 group"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} strokeWidth={2} />
                <span className="text-white/60 group-hover:text-white/90 text-[12px] font-semibold transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── LATEST STORIES ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
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
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <Newspaper className="w-8 h-8 text-white/10" strokeWidth={1.5} />
              <p className="text-white/25 text-sm">No stories yet. Check back soon.</p>
              <Link href="/feed" className="text-[#ccff00] font-semibold text-sm hover:underline">Go to Feed</Link>
            </div>
          ) : (
            <>
              {/* Row 1: hero + 2 stacked */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
                {featured && (
                  <div className="lg:col-span-8">
                    <PostCard post={featured} size="hero" />
                  </div>
                )}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  {secondary.map(p => <PostCard key={p.id} post={p} size="md" />)}
                </div>
              </div>

              {/* Row 2: 4 compact horizontal cards */}
              {listCards.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listCards.map(p => <PostCard key={p.id} post={p} size="sm" />)}
                </div>
              )}
            </>
          )}
        </section>

        {/* ── TRENDING ── */}
        {trending.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <SectionTitle accent="#ff4500" href="/category/Trending">Trending Now</SectionTitle>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* #1 big card */}
              <Link href={`/post/${trending[0].id}`} className="lg:col-span-6 group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#ff4500]/20 transition-all duration-300 block cursor-pointer" style={{ minHeight: 320 }}>
                {getImg(trending[0]) ? (
                  <img src={getImg(trending[0])} alt={trending[0].title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-[#0e0e0e]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/97 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#ff4500] text-white text-[10px] font-black uppercase tracking-[0.12em] px-3 py-1.5 rounded-full">#1 Trending</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  {trending[0].category && <span className="text-[#ff4500]/80 text-[10px] font-bold uppercase tracking-[0.14em] block mb-2">{trending[0].category}</span>}
                  <h3 className="text-white font-black text-[18px] sm:text-[22px] leading-tight mb-3 group-hover:text-[#ccff00] transition-colors">{trending[0].title}</h3>
                  <div className="flex items-center gap-3 text-white/35 text-[11px]">
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(trending[0].viewsCount || 0)}</span>
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(trending[0].reactionsCount || 0)}</span>
                  </div>
                </div>
              </Link>

              {/* #2–5 list */}
              <div className="lg:col-span-6 flex flex-col gap-2">
                {trending.slice(1, 5).map((post, i) => (
                  <Link key={post.id} href={`/post/${post.id}`} className="group flex gap-3 rounded-xl border border-white/[0.05] hover:border-white/[0.10] hover:bg-white/[0.015] transition-all p-3 cursor-pointer items-center">
                    <span className="text-[18px] font-black text-white/[0.07] w-6 shrink-0 text-center leading-none tabular-nums">#{i + 2}</span>
                    <div className="w-[64px] h-[50px] rounded-lg overflow-hidden shrink-0 relative bg-[#0e0e0e]">
                      {getImg(post) && <img src={getImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      {post.category && <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.14em] mb-0.5">{post.category}</span>}
                      <h3 className="text-white font-semibold text-[13px] leading-tight group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-white/25 text-[10px]">
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{fmtNum(post.viewsCount || 0)}</span>
                        <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/10 group-hover:text-[#ccff00]/50 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── MORE STORIES ── */}
        {moreStories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <SectionTitle accent="#a855f7" href="/feed">More Stories</SectionTitle>

            <div className="flex flex-col divide-y divide-white/[0.04]">
              {moreStories.map((post, i) => (
                <Link key={post.id} href={`/post/${post.id}`} className="group flex gap-4 py-4 hover:bg-white/[0.012] rounded-xl px-2 -mx-2 transition-colors cursor-pointer items-center">
                  <span className="text-[12px] font-black text-white/10 w-5 shrink-0 text-right tabular-nums">{i + 1}</span>
                  <div className="w-[80px] h-[60px] rounded-xl overflow-hidden shrink-0 relative bg-[#0e0e0e]">
                    {getImg(post) && <img src={getImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {post.category && <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.12em]">{post.category}</span>}
                      <span className="text-white/20 text-[10px]">·</span>
                      <span className="text-white/20 text-[10px]">{ago(post.createdAt)}</span>
                    </div>
                    <h3 className="text-white font-semibold text-[13px] leading-tight mb-1.5 group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
                    <div className="flex items-center gap-3 text-white/25 text-[10px]">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount || 0)}</span>
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount || 0)}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.commentsCount || 0}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/10 group-hover:text-[#ccff00]/50 transition-colors shrink-0" />
                </Link>
              ))}
            </div>

            <Link href="/feed" className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/[0.07] text-white/40 font-medium text-[13px] hover:border-white/[0.14] hover:text-white/70 transition-all">
              Load more stories <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 w-full">
          <div className="bg-[#ccff00] rounded-2xl px-7 py-8 sm:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <h3 className="text-black font-black text-[22px] sm:text-[26px] tracking-tight leading-tight mb-1">Stay Unfiltered.</h3>
              <p className="text-black/55 text-[13px]">Join 12.7K+ supporters. Real stories. No corporate filter.</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link href="/feed" className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold text-[13px] rounded-full hover:bg-[#111] transition-all whitespace-nowrap">
                <Flame className="w-3.5 h-3.5 text-[#ccff00]" strokeWidth={2.5} />
                Enter the Feed
              </Link>
              <Link href="/category/Trending" className="inline-flex items-center gap-2 px-5 py-3 bg-black/10 border border-black/15 text-black/80 font-bold text-[13px] rounded-full hover:bg-black/20 transition-all whitespace-nowrap">
                <TrendingUp className="w-3.5 h-3.5" />
                Trending
              </Link>
            </div>
          </div>
        </section>

        <Footer settings={profileSettings} />
        <BottomNav />
      </div>
    </>
  );
}
