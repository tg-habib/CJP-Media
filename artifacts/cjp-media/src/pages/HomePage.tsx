import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { collection, query, orderBy, limit, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  Flame, ArrowRight, TrendingUp, Newspaper, Users, Eye,
  ChevronRight, Megaphone, Zap, Globe, Clock,
  MessageCircle, ArrowUpRight, Radio, Mic2, Swords, Landmark, Sparkles, BarChart2
} from "lucide-react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import VerifiedBadge from "../components/VerifiedBadge";
import { formatDistanceToNow } from "date-fns";

const getPostImg = (post: any) =>
  post.imageUrls?.[0] || post.imageUrl || post.heroUrl || post.coverImage || "";

const fmtNum = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
  n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

const timeAgo = (createdAt: any) => {
  try {
    const date = typeof createdAt?.toDate === "function"
      ? createdAt.toDate()
      : new Date(createdAt);
    return formatDistanceToNow(date, { addSuffix: true }).replace("about ", "");
  } catch { return ""; }
};

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#0e0e0e] border border-white/5 overflow-hidden animate-pulse ${className}`}>
      <div className="aspect-video bg-white/[0.04]" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-2 bg-white/[0.04] rounded-full w-1/4" />
        <div className="h-4 bg-white/[0.04] rounded-full w-full" />
        <div className="h-4 bg-white/[0.04] rounded-full w-2/3" />
      </div>
    </div>
  );
}

const CATEGORIES = [
  { href: "/category/Trending",    label: "Trending",     Icon: TrendingUp,  color: "#ff4500" },
  { href: "/category/Politics",    label: "Politics",     Icon: Landmark,    color: "#1d9bf0" },
  { href: "/category/Satire",      label: "Satire",       Icon: Mic2,        color: "#ccff00" },
  { href: "/category/Youth Voice", label: "Youth Voice",  Icon: Megaphone,   color: "#a855f7" },
  { href: "/category/Breaking",    label: "Breaking",     Icon: Zap,         color: "#f59e0b" },
  { href: "/feed",                 label: "All Posts",    Icon: Newspaper,   color: "#00ba7c" },
];

export default function HomePage() {
  const [trendingPosts, setTrendingPosts]     = useState<any[]>([]);
  const [latestPosts,   setLatestPosts]       = useState<any[]>([]);
  const [profileSettings, setProfileSettings] = useState<any>(null);
  const [loading,       setLoading]           = useState(true);
  const [totalViews,    setTotalViews]        = useState(0);
  const [totalReactions,setTotalReactions]    = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileSnap = await getDoc(doc(db, "settings", "profile"));
        if (profileSnap.exists()) setProfileSettings(profileSnap.data());
      } catch (_) {}

      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(20));
      const unsub = onSnapshot(q, (snap) => {
        const all: any[] = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id, ...data,
            createdAt: data.createdAt?.toDate?.()?.getTime?.() ||
              (data.createdAt?._seconds ? data.createdAt._seconds * 1000 : data.createdAt) ||
              Date.now(),
          };
        });
        setLatestPosts(all);
        setTrendingPosts(
          [...all]
            .sort((a: any, b: any) =>
              ((b.viewsCount||0) + (b.reactionsCount||0)*2 + (b.sharesCount||0)*3) -
              ((a.viewsCount||0) + (a.reactionsCount||0)*2 + (a.sharesCount||0)*3)
            )
            .slice(0, 6)
        );
        setTotalViews(all.reduce((s: number, p: any) => s + (p.viewsCount||0), 0));
        setTotalReactions(all.reduce((s: number, p: any) => s + (p.reactionsCount||0), 0));
        setLoading(false);
      }, () => setLoading(false));
      return unsub;
    };
    let unsubPosts: (() => void) | undefined;
    fetchData().then(unsub => { unsubPosts = unsub; });
    return () => { if (unsubPosts) unsubPosts(); };
  }, []);

  const featuredPost    = latestPosts[0];
  const secondaryPosts  = latestPosts.slice(1, 5);
  const listPosts       = latestPosts.slice(5, 12);
  const mostRead        = [...latestPosts]
    .sort((a, b) => (b.viewsCount||0) - (a.viewsCount||0))
    .slice(0, 6);

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
    <div className="flex flex-col bg-[#050505] min-h-screen overflow-x-hidden pb-20 sm:pb-0">

      <Header settings={profileSettings} />

      {/* ── BREAKING TICKER ── */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/[0.05] overflow-hidden h-9 flex items-center">
        <div className="shrink-0 bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-[0.18em] px-4 h-full flex items-center gap-2 z-10 whitespace-nowrap">
          <Radio className="w-3 h-3" strokeWidth={2.5} /> LIVE
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex w-[200%] animate-marquee whitespace-nowrap">
            {[0, 1].map(i => (
              <div key={i} className="flex-1 flex items-center gap-10 text-white/40 text-[11px] font-medium tracking-wide px-6">
                {latestPosts.length > 0
                  ? latestPosts.slice(0, 6).map((p, idx) => (
                      <span key={idx} className="flex items-center gap-3 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#ccff00] shrink-0" />
                        {p.title}
                      </span>
                    ))
                  : (
                    <>
                      <span className="flex items-center gap-3 shrink-0"><span className="w-1 h-1 rounded-full bg-[#ccff00]" /> Voice of the Real Majority</span>
                      <span className="flex items-center gap-3 shrink-0"><span className="w-1 h-1 rounded-full bg-[#ccff00]" /> CJP Media — Unfiltered</span>
                      <span className="flex items-center gap-3 shrink-0"><span className="w-1 h-1 rounded-full bg-[#ccff00]" /> Stay Awake. Stay Janta.</span>
                    </>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden pt-10 sm:pt-14 pb-12">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-[#ccff00]/[0.05] rounded-full blur-[160px] -translate-y-1/3 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ccff00]/[0.03] rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        {profileSettings?.heroUrl && (
          <div className="absolute inset-0 pointer-events-none hidden sm:block">
            <img
              src={profileSettings.heroUrl}
              style={{ objectPosition: profileSettings.heroPosition || "center" }}
              className="absolute inset-0 w-full h-full object-cover opacity-[0.08]"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/80 to-[#050505]" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* LEFT — copy */}
            <div className="flex flex-col items-start">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]" />
                </span>
                <span className="text-white/50 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  {latestPosts.length > 0 ? `${latestPosts.length} Stories Live` : "Join the Movement"}
                </span>
              </div>

              <h1 className="text-[56px] sm:text-[72px] lg:text-[86px] font-black text-white tracking-[-3.5px] leading-[0.88] mb-7">
                Voice<br />of the<br /><span className="text-[#ccff00]">Real<br />Majority.</span>
              </h1>

              <p className="text-[15px] sm:text-base text-white/45 max-w-[380px] font-normal mb-10 leading-[1.75]">
                The official media wing of the Cockroach Janta Party — unfiltered satire, roasts, and the news they don't want you to see.
              </p>

              <div className="flex items-center gap-3 flex-wrap mb-10">
                <Link href="/feed" className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#ccff00] text-black font-bold text-[14px] tracking-wide rounded-full hover:bg-white transition-all duration-200 shadow-[0_0_40px_rgba(204,255,0,0.2)]">
                  Enter the Feed
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link href="/category/Trending" className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent border border-white/10 text-white/70 font-medium text-[14px] rounded-full hover:bg-white/[0.04] hover:border-white/20 hover:text-white transition-all">
                  <TrendingUp className="w-3.5 h-3.5 text-[#ccff00]" strokeWidth={2} />
                  Trending
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-6 pt-7 border-t border-white/[0.06] w-full">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2.5">
                    {[11,12,13,14].map(n => (
                      <img key={n} src={`https://i.pravatar.cc/80?img=${n}`} alt="" className="w-7 h-7 rounded-full border-2 border-[#050505] object-cover" />
                    ))}
                  </div>
                  <div>
                    <div className="text-white font-bold text-[13px] leading-tight">12.7K+</div>
                    <div className="text-white/30 text-[10px] font-medium leading-tight mt-0.5">Supporters</div>
                  </div>
                </div>
                <div className="w-px h-7 bg-white/[0.07]" />
                <div>
                  <div className="text-white font-bold text-[13px] leading-tight">{latestPosts.length || "—"}</div>
                  <div className="text-white/30 text-[10px] font-medium leading-tight mt-0.5">Posts</div>
                </div>
                <div className="w-px h-7 bg-white/[0.07]" />
                <div>
                  <div className="text-white font-bold text-[13px] leading-tight">{totalViews > 0 ? fmtNum(totalViews) : "—"}</div>
                  <div className="text-white/30 text-[10px] font-medium leading-tight mt-0.5">Views</div>
                </div>
                <div className="w-px h-7 bg-white/[0.07]" />
                <div>
                  <div className="text-[#ccff00] font-bold text-[13px] leading-tight">{totalReactions > 0 ? fmtNum(totalReactions) : "—"}</div>
                  <div className="text-white/30 text-[10px] font-medium leading-tight mt-0.5">Reactions</div>
                </div>
              </div>
            </div>

            {/* RIGHT — featured post card */}
            <div className="hidden lg:block">
              {featuredPost ? (
                <Link href={`/post/${featuredPost.id}`} className="group block relative rounded-3xl overflow-hidden border border-white/[0.07] hover:border-white/[0.16] transition-all duration-500 cursor-pointer shadow-[0_32px_80px_rgba(0,0,0,0.5)]" style={{ aspectRatio: "4/5" }}>
                  {getPostImg(featuredPost) ? (
                    <img
                      src={getPostImg(featuredPost)}
                      alt={featuredPost.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
                      <Flame className="w-14 h-14 text-[#ccff00]/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/98 via-black/30 to-transparent" />
                  <div className="absolute top-5 left-5 flex gap-2">
                    <span className="bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-[0.14em] px-3 py-1.5 rounded-full">
                      Featured
                    </span>
                    {featuredPost.category && (
                      <span className="bg-black/60 backdrop-blur-md text-white/70 text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-white/10">
                        {featuredPost.category}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <div className="flex items-center gap-2 mb-3">
                      {profileSettings?.avatarUrl ? (
                        <img src={profileSettings.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#ccff00]/10 flex items-center justify-center border border-[#ccff00]/20">
                          <Flame className="w-2.5 h-2.5 text-[#ccff00]" />
                        </div>
                      )}
                      <span className="text-white/50 text-[12px] font-medium flex items-center gap-1">
                        {profileSettings?.name || "CJP Media"}
                        <VerifiedBadge className="w-3 h-3" />
                      </span>
                    </div>
                    <h3 className="text-white font-black text-[22px] leading-[1.18] mb-4 group-hover:text-[#ccff00] transition-colors duration-300 line-clamp-3">
                      {featuredPost.title}
                    </h3>
                    <div className="flex items-center gap-4 text-white/35 text-[11px] font-medium">
                      <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(featuredPost.viewsCount||0)}</span>
                      <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(featuredPost.reactionsCount||0)}</span>
                      <span className="flex items-center gap-1.5 ml-auto text-white/25"><Clock className="w-3.5 h-3.5" />{timeAgo(featuredPost.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ) : (
                !loading && (
                  <div className="rounded-3xl bg-[#0a0a0a] border border-white/[0.05] flex items-center justify-center" style={{aspectRatio:"4/5"}}>
                    <Flame className="w-10 h-10 text-white/5" />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── ACCENT STRIP ── */}
      <div className="w-full bg-[#ccff00] overflow-hidden py-2.5">
        <div className="flex w-[200%] animate-marquee whitespace-nowrap">
          {[0, 1].map(i => (
            <div key={i} className="flex-1 flex items-center font-black text-[10px] uppercase tracking-[0.18em] gap-10 pr-10 text-black/70">
              <span className="shrink-0 flex items-center gap-2"><Flame className="w-3 h-3" strokeWidth={3} />Breaking News</span>
              <span className="shrink-0 flex items-center gap-2"><TrendingUp className="w-3 h-3" strokeWidth={3} />Viral Roasts</span>
              <span className="shrink-0 flex items-center gap-2"><Megaphone className="w-3 h-3" strokeWidth={3} />Uncensored Opinions</span>
              <span className="shrink-0 flex items-center gap-2"><Users className="w-3 h-3" strokeWidth={3} />Youth Voice</span>
              <span className="shrink-0 flex items-center gap-2"><Zap className="w-3 h-3" strokeWidth={3} />Stay Awake. Stay Janta.</span>
              <span className="shrink-0 flex items-center gap-2"><Radio className="w-3 h-3" strokeWidth={3} />CJP Media</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="w-full bg-[#050505] border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 sm:grid-cols-6 divide-x divide-white/[0.04]">
          {[
            { label: "Stories",      value: latestPosts.length || "—", Icon: Newspaper,  color: "text-white/60" },
            { label: "Total Views",  value: fmtNum(totalViews || 0),   Icon: Eye,         color: "text-[#1d9bf0]/70" },
            { label: "Reactions",    value: fmtNum(totalReactions||0), Icon: Flame,       color: "text-[#ff4500]/70" },
            { label: "Supporters",   value: "12.7K+",                  Icon: Users,       color: "text-[#a855f7]/70" },
            { label: "Topics",       value: "6+",                      Icon: Globe,       color: "text-[#00ba7c]/70" },
            { label: "Daily Active", value: "500+",                    Icon: BarChart2,   color: "text-[#ccff00]/70" },
          ].map(({ label, value, Icon, color }) => (
            <div key={label} className="flex flex-col items-center justify-center py-4 sm:py-5 gap-1.5">
              <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={1.75} />
              <span className="font-bold text-white text-[16px] sm:text-[20px] tracking-tight leading-none">{value}</span>
              <span className="text-white/25 text-[9px] font-medium uppercase tracking-[0.12em]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BROWSE TOPICS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-4 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-[18px] sm:text-[20px] tracking-tight">Browse Topics</h2>
          <Link href="/feed" className="text-white/30 hover:text-[#ccff00] text-[12px] font-medium flex items-center gap-1 transition-colors">
            All posts <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {CATEGORIES.map(({ href, label, Icon, color }) => (
            <Link
              key={href} href={href}
              className="group flex flex-col items-center justify-center gap-2.5 py-5 px-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200 text-center"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}14` }}>
                <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.75} />
              </div>
              <span className="font-semibold text-[11px] sm:text-[12px] text-white/60 group-hover:text-white/90 tracking-wide transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── LATEST STORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-5 bg-[#ccff00] rounded-full" />
            <h2 className="text-white font-bold text-[18px] sm:text-[20px] tracking-tight">Latest Stories</h2>
            <span className="bg-[#ccff00]/10 text-[#ccff00] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.14em] border border-[#ccff00]/15">Live</span>
          </div>
          <Link href="/feed" className="text-white/30 hover:text-[#ccff00] text-[12px] font-medium flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
            <SkeletonCard className="lg:col-span-8" />
            <div className="lg:col-span-4 flex flex-col gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : latestPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Newspaper className="w-8 h-8 text-white/10" strokeWidth={1.5} />
            <p className="text-white/25 font-medium text-[14px]">No stories yet. Check back soon.</p>
            <Link href="/feed" className="text-[#ccff00] font-semibold text-sm hover:underline">Go to Feed</Link>
          </div>
        ) : (
          <>
            {/* Hero + 2 stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              {featuredPost && (
                <Link href={`/post/${featuredPost.id}`} className="lg:col-span-8 group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.14] transition-all duration-300 block cursor-pointer" style={{ minHeight: 400 }}>
                  {getPostImg(featuredPost) ? (
                    <img src={getPostImg(featuredPost)} alt={featuredPost.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 bg-[#0e0e0e] flex items-center justify-center">
                      <Flame className="w-16 h-16 text-white/5" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/96 via-black/40 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white/70 text-[10px] font-semibold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-full" />Just In
                    </span>
                    {featuredPost.category && (
                      <span className="bg-[#ccff00] text-black text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full">{featuredPost.category}</span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
                    <h3 className="text-white font-black text-[22px] sm:text-[30px] leading-[1.15] mb-3 group-hover:text-[#ccff00] transition-colors duration-300">{featuredPost.title}</h3>
                    {featuredPost.roast && (
                      <p className="text-white/40 text-[13px] leading-relaxed line-clamp-2 mb-4 italic">{featuredPost.roast}</p>
                    )}
                    <div className="flex items-center gap-4 text-white/35 text-[11px] font-medium">
                      <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(featuredPost.viewsCount||0)}</span>
                      <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(featuredPost.reactionsCount||0)}</span>
                      <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />{featuredPost.commentsCount||0}</span>
                      <span className="flex items-center gap-1.5 ml-auto text-white/25"><Clock className="w-3 h-3" />{timeAgo(featuredPost.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              )}

              <div className="lg:col-span-4 flex flex-col gap-4">
                {secondaryPosts.slice(0, 2).map(post => (
                  <Link key={post.id} href={`/post/${post.id}`} className="group flex-1 relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.14] transition-all duration-300 flex flex-col cursor-pointer" style={{ minHeight: 188 }}>
                    {getPostImg(post) ? (
                      <img src={getPostImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 opacity-60" />
                    ) : (
                      <div className="absolute inset-0 bg-[#0e0e0e]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/97 via-black/50 to-transparent" />
                    <div className="absolute top-3 left-3">
                      {post.category && <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white/55 text-[10px] font-medium uppercase tracking-[0.1em] px-2.5 py-1 rounded-full">{post.category}</span>}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <h3 className="text-white font-bold text-[14px] leading-tight mb-2 group-hover:text-[#ccff00] transition-colors duration-300 line-clamp-2">{post.title}</h3>
                      <div className="flex items-center gap-3 text-white/30 text-[10px] font-medium">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount||0)}</span>
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount||0)}</span>
                        <span className="ml-auto">{timeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 2 horizontal cards */}
            {secondaryPosts.length > 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                {secondaryPosts.slice(2, 4).map(post => (
                  <Link key={post.id} href={`/post/${post.id}`} className="group flex gap-4 rounded-2xl border border-white/[0.05] hover:border-white/[0.10] hover:bg-white/[0.015] transition-all p-4 cursor-pointer items-center">
                    <div className="w-[104px] h-[76px] rounded-xl overflow-hidden shrink-0 relative bg-[#0e0e0e]">
                      {getPostImg(post) && <img src={getPostImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      {post.category && <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.14em] mb-1.5">{post.category}</span>}
                      <h3 className="text-white font-semibold text-[13px] sm:text-[14px] leading-tight mb-2 group-hover:text-[#ccff00] transition-colors duration-200 line-clamp-2">{post.title}</h3>
                      <div className="flex items-center gap-3 text-white/30 text-[10px] font-medium">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount||0)}</span>
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount||0)}</span>
                        <span className="ml-auto text-white/20">{timeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-[#ccff00]/60 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── TRENDING ── */}
      {trendingPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-5 bg-[#ff4500] rounded-full" />
              <h2 className="text-white font-bold text-[18px] sm:text-[20px] tracking-tight">Trending Now</h2>
              <span className="bg-[#ff4500]/10 border border-[#ff4500]/15 text-[#ff4500] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.14em]">
                Hot
              </span>
            </div>
            <Link href="/category/Trending" className="text-white/30 hover:text-[#ccff00] text-[12px] font-medium flex items-center gap-1 transition-colors">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {trendingPosts[0] && (
              <Link href={`/post/${trendingPosts[0].id}`} className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-[#ff4500]/20 transition-all duration-300 block cursor-pointer" style={{ minHeight: 360 }}>
                {getPostImg(trendingPosts[0]) ? (
                  <img src={getPostImg(trendingPosts[0])} alt={trendingPosts[0].title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-[#0e0e0e]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/97 via-black/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#ff4500] text-white text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full">
                    #1 Trending
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
                  {trendingPosts[0].category && (
                    <span className="text-[#ff4500]/80 text-[10px] font-semibold uppercase tracking-[0.14em] block mb-2">{trendingPosts[0].category}</span>
                  )}
                  <h3 className="text-white font-black text-[20px] sm:text-[26px] leading-tight mb-3 group-hover:text-[#ccff00] transition-colors duration-300">{trendingPosts[0].title}</h3>
                  <div className="flex items-center gap-4 text-white/35 text-[11px] font-medium">
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(trendingPosts[0].viewsCount||0)}</span>
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(trendingPosts[0].reactionsCount||0)}</span>
                    <span className="flex items-center gap-1.5 ml-auto text-white/25"><Clock className="w-3.5 h-3.5" />{timeAgo(trendingPosts[0].createdAt)}</span>
                  </div>
                </div>
              </Link>
            )}

            <div className="flex flex-col gap-2">
              {trendingPosts.slice(1, 5).map((post, i) => (
                <Link key={post.id} href={`/post/${post.id}`} className="group flex gap-4 rounded-xl border border-white/[0.05] hover:border-white/[0.10] hover:bg-white/[0.015] transition-all p-3.5 cursor-pointer items-center">
                  <span className="text-[20px] font-black text-white/[0.08] w-8 shrink-0 text-center leading-none tabular-nums">#{i+2}</span>
                  <div className="w-[72px] h-[56px] rounded-xl overflow-hidden shrink-0 relative bg-[#0e0e0e]">
                    {getPostImg(post) && <img src={getPostImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    {post.category && <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.14em] mb-0.5">{post.category}</span>}
                    <h3 className="text-white font-semibold text-[13px] leading-tight group-hover:text-[#ccff00] transition-colors duration-200 line-clamp-2">{post.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-white/25 text-[10px] font-medium">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount||0)}</span>
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount||0)}</span>
                      <span className="ml-auto text-white/20">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/10 group-hover:text-[#ccff00]/50 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MOST READ ── */}
      {mostRead.length > 0 && (
        <section className="py-8 w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-5 bg-[#1d9bf0] rounded-full" />
              <h2 className="text-white font-bold text-[18px] sm:text-[20px] tracking-tight">Most Read</h2>
            </div>
            <Link href="/feed" className="text-white/30 hover:text-[#ccff00] text-[12px] font-medium flex items-center gap-1 transition-colors">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-4 sm:px-6 lg:px-8">
            {mostRead.map((post, i) => (
              <Link key={post.id} href={`/post/${post.id}`} className="group shrink-0 w-[210px] sm:w-[250px] rounded-2xl overflow-hidden border border-white/[0.05] hover:border-white/[0.12] transition-all duration-300 bg-[#0a0a0a] cursor-pointer flex flex-col">
                <div className="w-full relative overflow-hidden bg-[#0e0e0e]" style={{ aspectRatio: "16/10" }}>
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="bg-[#1d9bf0] text-white text-[9px] font-bold px-2.5 py-1 rounded-full tracking-[0.08em] uppercase">#{i+1}</span>
                  </div>
                  {getPostImg(post) && <img src={getPostImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  {post.category && <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.14em] mb-1.5">{post.category}</span>}
                  <h3 className="text-white font-semibold text-[12px] leading-tight mb-3 group-hover:text-[#ccff00] transition-colors duration-200 line-clamp-2 flex-1">{post.title}</h3>
                  <div className="flex items-center gap-2 text-white/25 text-[10px] font-medium">
                    <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{fmtNum(post.viewsCount||0)}</span>
                    <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-[#ff4500]" />{fmtNum(post.reactionsCount||0)}</span>
                    <span className="ml-auto text-white/20">{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── MORE STORIES ── */}
      {listPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-5 bg-[#a855f7] rounded-full" />
              <h2 className="text-white font-bold text-[18px] sm:text-[20px] tracking-tight">More Stories</h2>
            </div>
            <Link href="/feed" className="text-white/30 hover:text-[#ccff00] text-[12px] font-medium flex items-center gap-1 transition-colors">
              View feed <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-white/[0.04]">
            {listPosts.map((post, i) => (
              <Link key={post.id} href={`/post/${post.id}`} className="group flex gap-4 py-4 hover:bg-white/[0.012] rounded-xl px-3 -mx-3 transition-colors cursor-pointer items-center">
                <span className="text-[13px] font-bold text-white/10 w-5 shrink-0 text-right tabular-nums">{i+1}</span>
                <div className="w-[80px] sm:w-[96px] h-[60px] sm:h-[72px] rounded-xl overflow-hidden shrink-0 relative bg-[#0e0e0e]">
                  {getPostImg(post) && <img src={getPostImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.category && <span className="text-[#ccff00] text-[9px] font-bold uppercase tracking-[0.12em]">{post.category}</span>}
                    <span className="text-white/20 text-[10px]">·</span>
                    <span className="text-white/20 text-[10px] font-medium">{timeAgo(post.createdAt)}</span>
                  </div>
                  <h3 className="text-white font-semibold text-[13px] sm:text-[14px] leading-tight mb-2 group-hover:text-[#ccff00] transition-colors duration-200 line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-3 text-white/25 text-[10px] font-medium">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount||0)}</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount||0)}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.commentsCount||0}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/10 group-hover:text-[#ccff00]/50 transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          <Link href="/feed" className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-white/[0.07] text-white/40 font-medium text-[13px] hover:border-white/[0.14] hover:text-white/70 transition-all">
            Load more stories <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* ── MANIFESTO ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="relative rounded-3xl overflow-hidden bg-[#080808] border border-white/[0.05] p-8 sm:p-12">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ccff00]/[0.04] rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-[300px] h-[300px] bg-[#ccff00]/[0.03] rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#ccff00]/[0.07] border border-[#ccff00]/[0.12] mb-7">
                <Megaphone className="w-3.5 h-3.5 text-[#ccff00]" strokeWidth={1.75} />
                <span className="text-[#ccff00] text-[10px] font-semibold uppercase tracking-[0.18em]">Who We Are</span>
              </div>
              <h2 className="text-[30px] sm:text-[42px] font-black text-white tracking-tight leading-[1.07] mb-6">
                We speak for the<br /><span className="text-[#ccff00]">unheard voices.</span>
              </h2>
              <p className="text-white/45 text-[14px] sm:text-[15px] leading-[1.8] mb-4 font-normal">
                CJP Media is the official media wing of the Cockroach Janta Party — the party that thrives when others try to exterminate it. We bring unfiltered political satire, raw roasts, and news the mainstream refuses to print.
              </p>
              <p className="text-white/45 text-[14px] sm:text-[15px] leading-[1.8] mb-9 font-normal">
                Because the cockroach always survives. And so does the truth.
              </p>
              <Link href="/feed" className="inline-flex items-center gap-2 px-6 py-3 bg-[#ccff00] text-black font-bold text-[13px] rounded-full hover:bg-white transition-all duration-200">
                Read Our Stories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Satire & Roasts",   desc: "We roast the powerful so the powerless can laugh.",  Icon: Mic2 },
                { label: "Unfiltered News",    desc: "Stories mainstream media buries deep.",              Icon: Newspaper },
                { label: "Youth Voice",        desc: "Platform for India's unemployed, ignored youth.",    Icon: Megaphone },
                { label: "Political Satire",   desc: "Holding power accountable through humour.",         Icon: Swords },
              ].map(({ label, desc, Icon }) => (
                <div key={label} className="bg-white/[0.025] border border-white/[0.05] rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/[0.04] transition-colors duration-200">
                  <div className="w-7 h-7 rounded-lg bg-[#ccff00]/[0.08] flex items-center justify-center border border-[#ccff00]/[0.1]">
                    <Icon className="w-3.5 h-3.5 text-[#ccff00]/70" strokeWidth={1.75} />
                  </div>
                  <h4 className="text-white font-semibold text-[12px] leading-tight">{label}</h4>
                  <p className="text-white/35 text-[11px] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
        <div className="bg-[#ccff00] rounded-2xl p-7 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-black font-black text-[24px] sm:text-[30px] tracking-tight leading-tight mb-1.5">Stay Unfiltered.</h3>
            <p className="text-black/55 text-[14px] font-normal">Join 12.7K+ supporters. Real stories. No corporate filter.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full sm:w-auto shrink-0">
            <Link href="/feed" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-black text-white font-bold text-[13px] rounded-full hover:bg-[#111] transition-all whitespace-nowrap">
              <Flame className="w-3.5 h-3.5 text-[#ccff00]" strokeWidth={2.5} />
              Enter the Feed
            </Link>
            <Link href="/category/Trending" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-black/10 border border-black/15 text-black/80 font-bold text-[13px] rounded-full hover:bg-black/20 transition-all whitespace-nowrap">
              <TrendingUp className="w-3.5 h-3.5" />
              What's Trending
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
