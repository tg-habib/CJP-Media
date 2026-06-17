import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { collection, query, orderBy, limit, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  Flame, ArrowRight, TrendingUp, Newspaper, Users, Eye,
  ChevronRight, Megaphone, Zap, Star, Globe, Clock,
  MessageCircle, ArrowUpRight, Radio
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
    <div className={`rounded-3xl bg-[#111] border border-white/5 overflow-hidden animate-pulse ${className}`}>
      <div className="aspect-video bg-white/5" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-2.5 bg-white/5 rounded-full w-1/3" />
        <div className="h-4 bg-white/5 rounded-full w-full" />
        <div className="h-4 bg-white/5 rounded-full w-3/4" />
      </div>
    </div>
  );
}

const CATEGORIES = [
  { href: "/category/Trending",   emoji: "🔥", label: "Trending",    color: "#ff4500", bg: "rgba(255,69,0,0.10)" },
  { href: "/category/Politics",   emoji: "🏛️", label: "Politics",    color: "#1d9bf0", bg: "rgba(29,155,240,0.10)" },
  { href: "/category/Satire",     emoji: "😂", label: "Satire",      color: "#ccff00", bg: "rgba(204,255,0,0.10)" },
  { href: "/category/Youth Voice",emoji: "✊", label: "Youth Voice", color: "#a855f7", bg: "rgba(168,85,247,0.10)" },
  { href: "/category/Breaking",   emoji: "⚡", label: "Breaking",    color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
  { href: "/feed",                emoji: "📰", label: "All Posts",   color: "#00ba7c", bg: "rgba(0,186,124,0.10)" },
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
    <div className="flex flex-col bg-[#000000] min-h-screen overflow-x-hidden pb-20 sm:pb-0">

      {/* ── HEADER ── */}
      <Header settings={profileSettings} />

      {/* ── TOP BREAKING TICKER (dark, shows real post titles) ── */}
      <div className="w-full bg-[#0e0e0e] border-b border-white/[0.06] overflow-hidden h-9 flex items-center">
        <div className="shrink-0 bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-widest px-4 h-full flex items-center gap-1.5 z-10 whitespace-nowrap">
          <Radio className="w-3 h-3" strokeWidth={3} /> LIVE
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex w-[200%] animate-marquee whitespace-nowrap">
            {[0, 1].map(i => (
              <div key={i} className="flex-1 flex items-center gap-8 text-white/50 text-[12px] font-semibold px-6">
                {latestPosts.length > 0
                  ? latestPosts.slice(0, 5).map((p, idx) => (
                      <span key={idx} className="flex items-center gap-2 shrink-0">
                        <span className="text-[#ccff00] shrink-0">•</span>{p.title}
                      </span>
                    ))
                  : (
                    <>
                      <span className="flex items-center gap-2 shrink-0"><span className="text-[#ccff00]">•</span> Voice of the Real Majority</span>
                      <span className="flex items-center gap-2 shrink-0"><span className="text-[#ccff00]">•</span> CJP Media: Unfiltered News</span>
                      <span className="flex items-center gap-2 shrink-0"><span className="text-[#ccff00]">•</span> Stay Awake. Stay Janta.</span>
                    </>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden pt-8 sm:pt-12 pb-10">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#ccff00]/7 rounded-full blur-[140px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ccff00]/4 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        {/* Hero background image overlay */}
        {profileSettings?.heroUrl && (
          <div className="absolute inset-0 pointer-events-none hidden sm:block">
            <img
              src={profileSettings.heroUrl}
              style={{ objectPosition: profileSettings.heroPosition || "center" }}
              className="absolute inset-0 w-full h-full object-cover opacity-15"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT — copy */}
            <div className="flex flex-col items-start">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]" />
                </span>
                <span className="text-white/60 text-[11px] font-bold uppercase tracking-widest">
                  {latestPosts.length > 0 ? `${latestPosts.length} Stories Live` : "Join the Movement"}
                </span>
              </div>

              <h1 className="text-[58px] sm:text-[74px] lg:text-[88px] font-black text-white tracking-[-3px] leading-[0.88] mb-6">
                Voice<br />of the<br /><span className="text-[#ccff00]">Real<br />Majority.</span>
              </h1>

              <p className="text-[15px] sm:text-[17px] text-white/50 max-w-[360px] font-medium mb-8 leading-relaxed">
                The official media wing of the Cockroach Janta Party — unfiltered satire, roasts, and the news they don't want you to see.
              </p>

              <div className="flex items-center gap-3 flex-wrap mb-8">
                <Link href="/feed" className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#ccff00] text-black font-extrabold text-[15px] rounded-full hover:bg-[#bbe600] transition-all duration-300 shadow-[0_0_35px_rgba(204,255,0,0.3)] hover:shadow-[0_0_50px_rgba(204,255,0,0.45)]">
                  Enter the Feed
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/category/Trending" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 text-white font-bold text-[15px] rounded-full hover:bg-white/10 hover:border-white/20 transition-all">
                  <TrendingUp className="w-4 h-4 text-[#ccff00]" />
                  Trending
                </Link>
              </div>

              {/* Social proof row */}
              <div className="flex items-center gap-5 pt-7 border-t border-white/[0.06] w-full">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {[11,12,13,14].map(n => (
                      <img key={n} src={`https://i.pravatar.cc/80?img=${n}`} alt="" className="w-7 h-7 rounded-full border-[1.5px] border-black object-cover" />
                    ))}
                  </div>
                  <div>
                    <div className="text-white font-extrabold text-[13px] leading-tight">12.7K+</div>
                    <div className="text-white/40 text-[10px] leading-tight">Supporters</div>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-white font-extrabold text-[13px] leading-tight">{latestPosts.length || "--"}</div>
                  <div className="text-white/40 text-[10px] leading-tight">Posts</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-white font-extrabold text-[13px] leading-tight">{totalViews > 0 ? fmtNum(totalViews) : "--"}</div>
                  <div className="text-white/40 text-[10px] leading-tight">Total Views</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-[#ff4500] font-extrabold text-[13px] leading-tight">{totalReactions > 0 ? fmtNum(totalReactions) : "--"}</div>
                  <div className="text-white/40 text-[10px] leading-tight">Reactions</div>
                </div>
              </div>
            </div>

            {/* RIGHT — featured post preview card (desktop only) */}
            <div className="hidden lg:block">
              {featuredPost ? (
                <Link href={`/post/${featuredPost.id}`} className="group block relative rounded-[36px] overflow-hidden border border-white/10 hover:border-[#ccff00]/40 transition-all duration-500 cursor-pointer" style={{ aspectRatio: "4/5" }}>
                  {getPostImg(featuredPost) ? (
                    <img
                      src={getPostImg(featuredPost)}
                      alt={featuredPost.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#1a1a1a] flex items-center justify-center">
                      <Flame className="w-16 h-16 text-[#ccff00]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  <div className="absolute top-5 left-5 flex gap-2">
                    <span className="bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Flame className="w-2.5 h-2.5" strokeWidth={3} /> Featured
                    </span>
                    {featuredPost.category && (
                      <span className="bg-black/70 backdrop-blur-md text-white/80 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10">
                        {featuredPost.category}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-7">
                    <div className="flex items-center gap-2 mb-3">
                      {profileSettings?.avatarUrl ? (
                        <img src={profileSettings.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover border border-[#ccff00]/30" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#ccff00]/20 flex items-center justify-center border border-[#ccff00]/30">
                          <Flame className="w-2.5 h-2.5 text-[#ccff00]" />
                        </div>
                      )}
                      <span className="text-white/60 text-[12px] font-bold flex items-center gap-1">
                        {profileSettings?.name || "CJP Media"}
                        <VerifiedBadge className="w-3 h-3" />
                      </span>
                    </div>
                    <h3 className="text-white font-black text-[22px] leading-tight mb-3 group-hover:text-[#ccff00] transition-colors line-clamp-3">
                      {featuredPost.title}
                    </h3>
                    <div className="flex items-center gap-4 text-white/50 text-[12px] font-semibold">
                      <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(featuredPost.viewsCount||0)}</span>
                      <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(featuredPost.reactionsCount||0)}</span>
                      <span className="flex items-center gap-1.5 ml-auto"><Clock className="w-3.5 h-3.5" />{timeAgo(featuredPost.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ) : (
                !loading && (
                  <div className="rounded-[36px] bg-[#0c0c0c] border border-white/5 flex items-center justify-center" style={{aspectRatio:"4/5"}}>
                    <Flame className="w-12 h-12 text-[#ccff00]/20" />
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── YELLOW SCROLLING STRIP ── */}
      <div className="w-full bg-[#ccff00] text-black overflow-hidden py-2.5 relative">
        <div className="flex w-[200%] animate-marquee whitespace-nowrap">
          {[0, 1].map(i => (
            <div key={i} className="flex-1 flex items-center justify-around font-extrabold text-[11px] uppercase tracking-widest gap-8 pr-8">
              <span className="flex items-center gap-2 shrink-0"><Flame className="w-3.5 h-3.5" strokeWidth={3} /> Breaking News</span>
              <span className="flex items-center gap-2 shrink-0"><TrendingUp className="w-3.5 h-3.5" strokeWidth={3} /> Viral Roasts</span>
              <span className="flex items-center gap-2 shrink-0"><Megaphone className="w-3.5 h-3.5" strokeWidth={3} /> Uncensored Opinions</span>
              <span className="flex items-center gap-2 shrink-0"><Users className="w-3.5 h-3.5" strokeWidth={3} /> Youth Voice</span>
              <span className="flex items-center gap-2 shrink-0"><Zap className="w-3.5 h-3.5" strokeWidth={3} /> Stay Awake. Stay Janta.</span>
              <span className="flex items-center gap-2 shrink-0"><Star className="w-3.5 h-3.5" strokeWidth={3} /> CJP Media</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PLATFORM STATS STRIP ── */}
      <div className="w-full bg-[#080808] border-b border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-3 sm:grid-cols-6 divide-x divide-white/[0.05]">
          {[
            { label: "Stories",    value: latestPosts.length || "--", icon: Newspaper, color: "text-white" },
            { label: "Total Views",value: fmtNum(totalViews || 0),   icon: Eye,        color: "text-[#1d9bf0]" },
            { label: "Reactions",  value: fmtNum(totalReactions||0), icon: Flame,      color: "text-[#ff4500]" },
            { label: "Supporters", value: "12.7K+",                  icon: Users,      color: "text-[#a855f7]" },
            { label: "Topics",     value: "6+",                      icon: Globe,      color: "text-[#00ba7c]" },
            { label: "Daily Active",value: "500+",                   icon: Zap,        color: "text-[#ccff00]" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex flex-col items-center justify-center py-4 sm:py-5 gap-1">
              <Icon className={`w-4 h-4 mb-0.5 ${color}`} strokeWidth={2} />
              <span className="font-extrabold text-white text-[17px] sm:text-[21px] tracking-tight leading-none">{value}</span>
              <span className="text-white/35 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BROWSE TOPICS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4 w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-black text-[20px] sm:text-[24px] tracking-tight">Browse Topics</h2>
          <Link href="/feed" className="text-white/40 hover:text-[#ccff00] text-[12px] font-bold flex items-center gap-1 transition-colors">
            All posts <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
          {CATEGORIES.map(({ href, emoji, label, color, bg }) => (
            <Link
              key={href} href={href}
              className="group flex flex-col items-center justify-center gap-2 py-4 sm:py-5 px-2 rounded-2xl border transition-all duration-300 cursor-pointer text-center hover:scale-105"
              style={{ borderColor: `${color}25`, backgroundColor: bg }}
            >
              <span className="text-[26px] sm:text-[30px] group-hover:scale-110 transition-transform duration-200 leading-none">{emoji}</span>
              <span className="font-extrabold text-[11px] sm:text-[12px] text-white/80 tracking-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── LATEST STORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#ccff00] rounded-full" />
            <h2 className="text-white font-black text-[20px] sm:text-[24px] tracking-tight">Latest Stories</h2>
            <span className="bg-white/5 border border-white/10 text-white/40 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
          </div>
          <Link href="/feed" className="text-white/40 hover:text-[#ccff00] text-[12px] font-bold flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-4 h-4" />
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
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <Flame className="w-10 h-10 text-[#ccff00]/30" />
            <p className="text-white/30 font-semibold">No stories yet. Check back soon.</p>
            <Link href="/feed" className="text-[#ccff00] font-bold text-sm hover:underline">Go to Feed →</Link>
          </div>
        ) : (
          <>
            {/* Hero + 2 stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
              {featuredPost && (
                <Link href={`/post/${featuredPost.id}`} className="lg:col-span-8 group relative rounded-[28px] overflow-hidden border border-white/5 hover:border-white/15 transition-all duration-300 block cursor-pointer" style={{ minHeight: 420 }}>
                  {getPostImg(featuredPost) ? (
                    <img src={getPostImg(featuredPost)} alt={featuredPost.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#1a1a1a] flex items-center justify-center">
                      <Flame className="w-20 h-20 text-[#ccff00]/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <span className="bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-pulse" />Just In
                    </span>
                    {featuredPost.category && (
                      <span className="bg-[#ccff00] text-black text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">{featuredPost.category}</span>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
                    <h3 className="text-white font-black text-[24px] sm:text-[32px] leading-[1.1] mb-3 group-hover:text-[#ccff00] transition-colors">{featuredPost.title}</h3>
                    {featuredPost.roast && (
                      <p className="text-white/55 text-[14px] leading-relaxed line-clamp-2 mb-4 italic">"{featuredPost.roast}"</p>
                    )}
                    <div className="flex items-center gap-4 text-white/45 text-[12px] font-semibold">
                      <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(featuredPost.viewsCount||0)}</span>
                      <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(featuredPost.reactionsCount||0)}</span>
                      <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" />{featuredPost.commentsCount||0}</span>
                      <span className="flex items-center gap-1.5 ml-auto"><Clock className="w-3.5 h-3.5" />{timeAgo(featuredPost.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              )}

              <div className="lg:col-span-4 flex flex-col gap-4">
                {secondaryPosts.slice(0, 2).map(post => (
                  <Link key={post.id} href={`/post/${post.id}`} className="group flex-1 relative rounded-[24px] overflow-hidden border border-white/5 hover:border-white/15 transition-all duration-300 flex flex-col cursor-pointer" style={{ minHeight: 190 }}>
                    {getPostImg(post) ? (
                      <img src={getPostImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70" />
                    ) : (
                      <div className="absolute inset-0 bg-[#111]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                    <div className="absolute top-3 left-3">
                      {post.category && <span className="bg-black/70 backdrop-blur-md border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">{post.category}</span>}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <h3 className="text-white font-bold text-[15px] leading-tight mb-2 group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
                      <div className="flex items-center gap-3 text-white/40 text-[11px] font-semibold">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount||0)}</span>
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount||0)}</span>
                        <span className="ml-auto">{timeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 2 more horizontal thumbnail cards */}
            {secondaryPosts.length > 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                {secondaryPosts.slice(2, 4).map(post => (
                  <Link key={post.id} href={`/post/${post.id}`} className="group flex gap-4 rounded-[20px] border border-white/5 hover:border-white/12 hover:bg-white/[0.015] transition-all p-4 cursor-pointer items-center">
                    <div className="w-[110px] h-[80px] rounded-[14px] overflow-hidden shrink-0 relative bg-[#111]">
                      {getPostImg(post) && <img src={getPostImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <div className="flex flex-col flex-1 py-0.5 min-w-0">
                      {post.category && <span className="text-[#ccff00] text-[10px] font-black uppercase tracking-wider mb-1.5">{post.category}</span>}
                      <h3 className="text-white font-bold text-[14px] sm:text-[15px] leading-tight mb-2 group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
                      <div className="flex items-center gap-3 text-white/40 text-[11px] font-semibold">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount||0)}</span>
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount||0)}</span>
                        <span className="ml-auto text-white/30">{timeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-[#ccff00] transition-colors shrink-0" />
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#ff4500] rounded-full" />
              <h2 className="text-white font-black text-[20px] sm:text-[24px] tracking-tight">Trending Now</h2>
              <span className="bg-[#ff4500]/10 border border-[#ff4500]/20 text-[#ff4500] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-2.5 h-2.5" strokeWidth={3} /> Hot
              </span>
            </div>
            <Link href="/category/Trending" className="text-white/40 hover:text-[#ccff00] text-[12px] font-bold flex items-center gap-1 transition-colors">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* #1 Big card */}
            {trendingPosts[0] && (
              <Link href={`/post/${trendingPosts[0].id}`} className="group relative rounded-[28px] overflow-hidden border border-white/5 hover:border-[#ff4500]/30 transition-all duration-300 block cursor-pointer" style={{ minHeight: 380 }}>
                {getPostImg(trendingPosts[0]) ? (
                  <img src={getPostImg(trendingPosts[0])} alt={trendingPosts[0].title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-[#111]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#ff4500] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Flame className="w-2.5 h-2.5" strokeWidth={3} /> #1 Trending
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
                  {trendingPosts[0].category && (
                    <span className="text-[#ff4500] text-[10px] font-black uppercase tracking-wider block mb-2">{trendingPosts[0].category}</span>
                  )}
                  <h3 className="text-white font-black text-[22px] sm:text-[28px] leading-tight mb-3 group-hover:text-[#ccff00] transition-colors">{trendingPosts[0].title}</h3>
                  <div className="flex items-center gap-4 text-white/45 text-[12px] font-semibold">
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{fmtNum(trendingPosts[0].viewsCount||0)}</span>
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[#ff4500]" />{fmtNum(trendingPosts[0].reactionsCount||0)}</span>
                    <span className="flex items-center gap-1.5 ml-auto"><Clock className="w-3.5 h-3.5" />{timeAgo(trendingPosts[0].createdAt)}</span>
                  </div>
                </div>
              </Link>
            )}

            {/* #2–#5 ranked list */}
            <div className="flex flex-col gap-2.5">
              {trendingPosts.slice(1, 5).map((post, i) => (
                <Link key={post.id} href={`/post/${post.id}`} className="group flex gap-4 rounded-[18px] border border-white/5 hover:border-white/15 hover:bg-white/[0.02] transition-all p-3.5 cursor-pointer items-center">
                  <span className="text-[26px] font-black text-white/10 w-9 shrink-0 text-center leading-none tabular-nums">#{i+2}</span>
                  <div className="w-[78px] h-[60px] rounded-[12px] overflow-hidden shrink-0 relative bg-[#111]">
                    {getPostImg(post) && <img src={getPostImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    {post.category && <span className="text-[#ccff00] text-[10px] font-black uppercase tracking-wider mb-0.5">{post.category}</span>}
                    <h3 className="text-white font-bold text-[14px] leading-tight group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-white/40 text-[11px] font-semibold">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount||0)}</span>
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount||0)}</span>
                      <span className="ml-auto text-white/25">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-white/15 group-hover:text-[#ccff00] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MOST READ (horizontal scroll) ── */}
      {mostRead.length > 0 && (
        <section className="py-8 w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#1d9bf0] rounded-full" />
              <h2 className="text-white font-black text-[20px] sm:text-[24px] tracking-tight">Most Read</h2>
            </div>
            <Link href="/feed" className="text-white/40 hover:text-[#ccff00] text-[12px] font-bold flex items-center gap-1 transition-colors">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3.5 overflow-x-auto scrollbar-hide pb-2 px-4 sm:px-6 lg:px-8">
            {mostRead.map((post, i) => (
              <Link key={post.id} href={`/post/${post.id}`} className="group shrink-0 w-[220px] sm:w-[260px] rounded-[22px] overflow-hidden border border-white/5 hover:border-white/15 transition-all duration-300 bg-[#0c0c0c] cursor-pointer flex flex-col">
                <div className="w-full relative overflow-hidden bg-[#111]" style={{ aspectRatio: "16/10" }}>
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="bg-[#1d9bf0] text-white text-[9px] font-black px-2 py-0.5 rounded-full">#{i+1} Most Read</span>
                  </div>
                  {getPostImg(post) && <img src={getPostImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  {post.category && <span className="text-[#ccff00] text-[9px] font-black uppercase tracking-wider mb-1.5">{post.category}</span>}
                  <h3 className="text-white font-bold text-[13px] leading-tight mb-3 group-hover:text-[#ccff00] transition-colors line-clamp-2 flex-1">{post.title}</h3>
                  <div className="flex items-center gap-2 text-white/40 text-[10px] font-semibold">
                    <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{fmtNum(post.viewsCount||0)}</span>
                    <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-[#ff4500]" />{fmtNum(post.reactionsCount||0)}</span>
                    <span className="ml-auto text-white/25">{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── MORE STORIES (numbered list) ── */}
      {listPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#a855f7] rounded-full" />
              <h2 className="text-white font-black text-[20px] sm:text-[24px] tracking-tight">More Stories</h2>
            </div>
            <Link href="/feed" className="text-white/40 hover:text-[#ccff00] text-[12px] font-bold flex items-center gap-1 transition-colors">
              View feed <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-white/[0.04]">
            {listPosts.map((post, i) => (
              <Link key={post.id} href={`/post/${post.id}`} className="group flex gap-4 py-4 hover:bg-white/[0.015] rounded-2xl px-3 -mx-3 transition-colors cursor-pointer items-center">
                <span className="text-[14px] font-black text-white/15 w-6 shrink-0 text-right tabular-nums">{i+1}</span>
                <div className="w-[80px] sm:w-[100px] h-[62px] sm:h-[74px] rounded-[12px] overflow-hidden shrink-0 relative bg-[#111]">
                  {getPostImg(post) && <img src={getPostImg(post)} alt={post.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.category && <span className="text-[#ccff00] text-[10px] font-black uppercase tracking-wider">{post.category}</span>}
                    <span className="text-white/25 text-[10px]">•</span>
                    <span className="text-white/30 text-[10px] font-semibold">{timeAgo(post.createdAt)}</span>
                  </div>
                  <h3 className="text-white font-bold text-[14px] sm:text-[15px] leading-tight mb-2 group-hover:text-[#ccff00] transition-colors line-clamp-2">{post.title}</h3>
                  <div className="flex items-center gap-3 text-white/40 text-[11px] font-semibold">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{fmtNum(post.viewsCount||0)}</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#ff4500]" />{fmtNum(post.reactionsCount||0)}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.commentsCount||0}</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-[#ccff00] transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          <Link href="/feed" className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-white/8 text-white/50 font-bold text-[13px] hover:border-[#ccff00]/25 hover:text-[#ccff00] transition-all">
            Load more stories <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* ── MANIFESTO ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="relative rounded-[32px] overflow-hidden bg-[#0a0a0a] border border-white/5 p-8 sm:p-12">
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[#ccff00]/5 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-[250px] h-[250px] bg-[#ccff00]/4 rounded-full blur-[70px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 mb-6">
                <Megaphone className="w-3.5 h-3.5 text-[#ccff00]" />
                <span className="text-[#ccff00] text-[10px] font-black uppercase tracking-widest">Who We Are</span>
              </div>
              <h2 className="text-[32px] sm:text-[44px] font-black text-white tracking-tight leading-[1.05] mb-6">
                We speak for the<br /><span className="text-[#ccff00]">unheard voices.</span>
              </h2>
              <p className="text-white/55 text-[15px] leading-relaxed mb-4 font-medium">
                CJP Media is the official media wing of the Cockroach Janta Party — the party that thrives when others try to exterminate it. We bring unfiltered political satire, raw roasts, and news the mainstream refuses to print.
              </p>
              <p className="text-white/55 text-[15px] leading-relaxed mb-8 font-medium">
                Because the cockroach always survives. And so does the truth.
              </p>
              <Link href="/feed" className="inline-flex items-center gap-2 px-6 py-3 bg-[#ccff00] text-black font-extrabold text-[14px] rounded-full hover:bg-[#bbe600] transition-all">
                Read Our Stories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Satire & Roasts",   desc: "We roast the powerful so the powerless can laugh.",  emoji: "🔥" },
                { label: "Unfiltered News",    desc: "Stories mainstream media buries deep.",              emoji: "📰" },
                { label: "Youth Voice",        desc: "Platform for India's unemployed, ignored youth.",    emoji: "✊" },
                { label: "Political Satire",   desc: "Holding power accountable through humour.",         emoji: "🏛️" },
              ].map(({ label, desc, emoji }) => (
                <div key={label} className="bg-white/[0.03] border border-white/5 rounded-[18px] p-4 flex flex-col gap-2 hover:bg-white/[0.05] transition-colors">
                  <span className="text-[22px] leading-none">{emoji}</span>
                  <h4 className="text-white font-bold text-[13px] leading-tight">{label}</h4>
                  <p className="text-white/45 text-[12px] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── JOIN CTA STRIP ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
        <div className="bg-[#ccff00] rounded-[28px] p-7 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-black font-black text-[26px] sm:text-[32px] tracking-[-1px] leading-tight mb-1">Stay Unfiltered.</h3>
            <p className="text-black/65 text-[15px] font-semibold">Join 12.7K+ supporters. Real stories. No corporate filter.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto shrink-0">
            <Link href="/feed" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-black text-white font-extrabold text-[14px] rounded-full hover:bg-[#111] transition-all whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <Flame className="w-4 h-4 text-[#ccff00]" strokeWidth={3} />
              Enter the Feed
            </Link>
            <Link href="/category/Trending" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-black/10 border border-black/20 text-black font-extrabold text-[14px] rounded-full hover:bg-black/20 transition-all whitespace-nowrap">
              <TrendingUp className="w-4 h-4" />
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
