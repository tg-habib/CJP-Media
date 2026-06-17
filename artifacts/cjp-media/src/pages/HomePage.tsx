import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Flame, ArrowRight, TrendingUp, Newspaper, Users, Eye, Heart, ChevronRight, Megaphone } from "lucide-react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import VerifiedBadge from "../components/VerifiedBadge";
import { ErrorBoundary } from "../components/ErrorBoundary";

export default function HomePage() {
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [profileSettings, setProfileSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileSnap = await getDoc(doc(db, "settings", "profile"));
        if (profileSnap.exists()) setProfileSettings(profileSnap.data());

        const snap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(10)));
        const latest = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id, ...data,
            createdAt: data.createdAt?.toDate?.()?.getTime?.() || (data.createdAt?._seconds ? data.createdAt._seconds * 1000 : data.createdAt) || Date.now(),
          };
        });
        setLatestPosts(latest);
        setTrendingPosts([...latest].sort((a: any, b: any) => ((b.viewsCount || 0) + (b.reactionsCount || 0)) - ((a.viewsCount || 0) + (a.reactionsCount || 0))).slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
    <Helmet>
      <title>CJP Media — Voice of the Real Majority</title>
      <meta name="description" content="The official media wing of the Cockroach Janta Party. Unfiltered political satire, roasts, and news." />
      <meta property="og:title" content="CJP Media — Voice of the Real Majority" />
      <meta property="og:description" content="The official media wing of the Cockroach Janta Party. Unfiltered political satire, roasts, and news." />
      <meta property="og:image" content="/opengraph.jpg" />
    </Helmet>
    <div className="flex flex-col relative overflow-hidden bg-[#050505] min-h-screen pb-20 sm:pb-0">
      {/* Hero background */}
      {(profileSettings?.heroUrl || profileSettings?.mobileHeroUrl) ? (
        <>
          <div className="absolute top-0 inset-x-0 h-[500px] sm:h-[600px] pointer-events-none">
            {profileSettings.heroUrl && profileSettings.mobileHeroUrl ? (
              <>
                <img src={profileSettings.mobileHeroUrl} style={{ objectPosition: profileSettings.mobileHeroPosition || "center" }} className="absolute inset-0 w-full h-full object-cover opacity-60 sm:hidden" alt="Hero Mobile" />
                <img src={profileSettings.heroUrl} style={{ objectPosition: profileSettings.heroPosition || "center" }} className="absolute inset-0 w-full h-full object-cover opacity-60 hidden sm:block" alt="Hero Desktop" />
              </>
            ) : (
              <img src={profileSettings.heroUrl || profileSettings.mobileHeroUrl} style={{ objectPosition: profileSettings.heroPosition || profileSettings.mobileHeroPosition || "center" }} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Hero" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]"></div>
          </div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ccff00]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
        </>
      ) : (
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ccff00]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
      )}

      <Header settings={profileSettings} />

      <div className="w-full max-w-4xl mx-auto px-4 pt-10 pb-12 relative z-10 flex flex-col items-start text-left mt-0 sm:mt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]"></span>
          </span>
          <span className="text-white/80 text-[11px] font-bold uppercase tracking-widest">Join the Movement</span>
        </div>

        <h1 className="text-6xl sm:text-7xl md:text-[88px] font-extrabold text-white tracking-tighter leading-[0.95] mb-6 pr-8">
          Voice of the <br className="hidden sm:block" /><span className="text-[#ccff00]">Real Majority.</span>
        </h1>

        <p className="text-base sm:text-xl text-white/60 max-w-[280px] sm:max-w-xl font-medium mb-8 leading-relaxed">
          The official media wing of the Cockroach Janta Party. We bring forth the unfiltered voice of the unemployed youth and stand together as one.
        </p>

        <Link href="/feed" className="group relative inline-flex items-center gap-3 px-6 py-3.5 bg-[#ccff00] text-black font-extrabold text-[15px] rounded-full hover:bg-[#bbe600] transition-all shadow-none">
          <span>Enter the Feed</span>
          <div className="bg-black/10 rounded-full p-1 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4 text-black" />
          </div>
        </Link>

        <div className="flex items-center gap-3 mt-8 mb-8">
          <div className="flex -space-x-2">
            {[11,12,13,14].map(n => (
              <img key={n} src={`https://i.pravatar.cc/100?img=${n}`} alt="avatar" className="w-8 h-8 rounded-full border border-[#050505] object-cover" />
            ))}
          </div>
          <div className="flex flex-col items-start justify-center gap-0">
            <span className="font-bold text-white text-[13px] leading-tight">12.7K+</span>
            <span className="text-white/50 text-[10px] leading-tight">Active Supporters</span>
          </div>
        </div>
      </div>

      {/* Ticker Tape Marquee */}
      <div className="w-full bg-[#ccff00] text-black overflow-hidden py-2.5 relative z-10 flex shadow-[0_0_20px_rgba(204,255,0,0.15)] mb-10 border-y border-black/20">
        <div className="flex w-[200%] animate-marquee">
          {[0, 1].map(i => (
            <div key={i} className="flex-1 flex justify-around items-center whitespace-nowrap font-extrabold text-[13px] uppercase tracking-widest gap-8 pr-8">
              <span className="flex items-center gap-2"><Flame className="w-4 h-4" strokeWidth={3} /> Breaking News</span>
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" strokeWidth={3} /> Viral Roasts</span>
              <span className="flex items-center gap-2"><Megaphone className="w-4 h-4" strokeWidth={3} /> Uncensored Opinions</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" strokeWidth={3} /> Youth Voice</span>
              <span className="flex items-center gap-2"><Flame className="w-4 h-4" strokeWidth={3} /> Breaking News</span>
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" strokeWidth={3} /> Viral Roasts</span>
              <span className="flex items-center gap-2"><Megaphone className="w-4 h-4" strokeWidth={3} /> Uncensored Opinions</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" strokeWidth={3} /> Youth Voice</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 text-left pb-6 relative z-10 pt-4">
        <div className="flex w-full overflow-x-auto gap-4 hide-scrollbar pb-8">
          {[
            { href: "/category/Trending", icon: TrendingUp, title: "Trending Roasts", desc: "Viral takes that\nspeak truth." },
            { href: "/category/Politics", icon: Newspaper, title: "Unfiltered News", desc: "News that mainstream\nwon't show you." },
            { href: "/category/Youth%20Voice", icon: Users, title: "Youth Voice", desc: "Stories, opinions &\nvoices that matter." },
          ].map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href} className="shrink-0 flex gap-4 text-left p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all items-center backdrop-blur-sm group">
              <div className="w-12 h-12 rounded-full bg-[#ccff00]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-[#ccff00]" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-white font-bold text-sm leading-tight mb-1.5">{title}</h3>
                <p className="text-white/50 text-xs leading-tight flex items-center pr-2 relative w-[140px]">{desc}<ChevronRight className="w-3.5 h-3.5 absolute right-0 bottom-0 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" /></p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Section */}
      {trendingPosts.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-6 mt-6 px-4 sm:px-0 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#ccff00]" />
              </div>
              <h2 className="text-white font-extrabold text-2xl tracking-tight">Trending Now</h2>
            </div>
            <Link href="/category/Trending" className="flex items-center gap-1 text-white/50 hover:text-white transition-colors text-sm font-semibold group/link">
              View all <ChevronRight className="w-4 h-4 text-white/30 group-hover/link:text-white group-hover/link:translate-x-1 transition-all" />
            </Link>
          </div>
          <div className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-5 pb-10 px-4 sm:px-4 max-w-4xl mx-auto">
            {trendingPosts.map((post) => {
              const img = post.imageUrls?.[0] || post.imageUrl || post.heroUrl;
              return (
                <Link key={`trending-${post.id}`} href={`/post/${post.id}`} className="flex flex-col snap-start shrink-0 w-[280px] sm:w-[320px] rounded-[30px] overflow-hidden bg-[#0c0c0c] border border-white/5 relative group cursor-pointer hover:border-[#ccff00]/30 transition-all duration-500">
                  <div className="w-full relative aspect-square bg-[#050505] overflow-hidden shrink-0">
                    <div className="absolute top-4 left-4 bg-[#ccff00] text-black text-[10px] uppercase font-black px-3 py-1.5 rounded-full z-20 shadow-md flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" /> Trending
                    </div>
                    {img && <img src={img} referrerPolicy="no-referrer" className="absolute inset-0 object-cover w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700" alt={post.title} />}
                  </div>
                  <div className="p-6 flex flex-col flex-1 items-start text-left bg-[#0c0c0c] justify-between">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-white/70 text-[11px] tracking-wide flex items-center">
                        {profileSettings?.avatarUrl ? (
                          <img src={profileSettings.avatarUrl} alt="Author" className="w-[18px] h-[18px] rounded-full object-cover border border-[#ccff00]/30 mr-1.5" />
                        ) : (
                          <span className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#ccff00]/20 to-transparent border border-[#ccff00]/40 flex items-center justify-center mr-1.5">
                            <Flame className="w-2.5 h-2.5 text-[#ccff00]" />
                          </span>
                        )}
                        {profileSettings?.username?.toUpperCase() || "CJP MEDIA"} <VerifiedBadge className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                    <h3 className="font-extrabold text-white text-[18px] sm:text-[20px] leading-snug mb-5 line-clamp-3 group-hover:text-[#ccff00] transition-colors">{post.title}</h3>
                    <div className="flex items-center justify-between w-full text-white/50 text-[12px] font-bold mt-auto">
                      <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-[#ccff00]/70" /> {post.viewsCount || 0} views</span>
                      <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> {post.reactionsCount || 0}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* Latest Section */}
      {latestPosts.length > 0 && (
        <div className="mt-8 text-left pb-16 px-4 sm:px-4 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-white font-extrabold text-2xl tracking-tight">Latest Updates</h2>
            </div>
            <Link href="/feed" className="flex items-center gap-1 text-white/50 hover:text-white transition-colors text-sm font-semibold group/link">
              View feed <ChevronRight className="w-4 h-4 text-white/30 group-hover/link:text-white group-hover/link:translate-x-1 transition-all" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 w-full">
            {latestPosts[0] && (() => {
              const img0 = latestPosts[0].imageUrls?.[0] || latestPosts[0].imageUrl || latestPosts[0].heroUrl;
              return (
                <Link href={`/post/${latestPosts[0].id}`} className="lg:col-span-8 flex flex-col h-full rounded-[32px] overflow-hidden bg-[#0c0c0c] border border-white/5 relative group cursor-pointer hover:border-white/15 transition-all">
                  <div className="h-[300px] sm:h-[400px] lg:h-[480px] w-full relative shrink-0">
                    <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[10px] uppercase font-bold px-4 py-2 rounded-full z-10 shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>Just In
                    </div>
                    {img0 && <img src={img0} referrerPolicy="no-referrer" className="absolute inset-0 object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700" alt={latestPosts[0].title} />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent pointer-events-none z-10"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 flex flex-col items-start z-20">
                      <h3 className="font-extrabold text-white text-[24px] sm:text-[32px] lg:text-[40px] leading-[1.1] mb-4 group-hover:text-[#ccff00] transition-colors drop-shadow-lg max-w-3xl">{latestPosts[0].title}</h3>
                    </div>
                  </div>
                </Link>
              );
            })()}

            <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
              {latestPosts.slice(1, 3).map(post => {
                const img = post.imageUrls?.[0] || post.imageUrl || post.heroUrl;
                return (
                  <Link key={`latest-${post.id}`} href={`/post/${post.id}`} className="flex flex-col sm:flex-row lg:flex-col gap-0 rounded-[28px] overflow-hidden bg-[#0c0c0c] border border-white/5 group relative cursor-pointer hover:border-white/15 transition-all">
                    <div className="w-full sm:w-[240px] lg:w-full relative shrink-0 overflow-hidden bg-[#050505] aspect-video">
                      {img && <img src={img} referrerPolicy="no-referrer" className="absolute inset-0 object-cover w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700" alt={post.title} />}
                    </div>
                    <div className="flex flex-col flex-1 justify-center p-6 bg-[#0c0c0c] z-20 relative">
                      <h3 className="font-extrabold text-white text-[17px] sm:text-[18px] leading-tight mb-3 group-hover:text-[#ccff00] transition-colors line-clamp-3">{post.title}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {latestPosts.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {latestPosts.slice(3, 7).map((post) => {
                const img = post.imageUrls?.[0] || post.imageUrl || post.heroUrl;
                return (
                  <Link key={`latest-bottom-${post.id}`} href={`/post/${post.id}`} className="flex gap-4 sm:gap-5 block bg-transparent group relative cursor-pointer p-4 rounded-[24px] border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-[100px] sm:w-[140px] h-[100px] sm:h-[120px] rounded-[16px] overflow-hidden shrink-0 bg-[#0c0c0c] relative">
                      {img && <img src={img} referrerPolicy="no-referrer" className="absolute inset-0 object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700" alt={post.title} />}
                    </div>
                    <div className="flex flex-col flex-1 justify-center py-1">
                      <h3 className="font-extrabold text-white text-[15px] leading-tight mb-2 group-hover:text-[#ccff00] transition-colors line-clamp-3">{post.title}</h3>
                      <p className="text-white/50 text-[12px] font-bold capitalize">{post.category}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin"></div>
        </div>
      )}

      <Footer settings={profileSettings} />
      <BottomNav />
    </div>
    </>
  );
}
