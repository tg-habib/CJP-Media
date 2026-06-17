import Link from 'next/link';
import { Flame, ArrowRight, TrendingUp, Newspaper, Users, Eye, Heart, MessageCircle, ChevronRight, Megaphone } from 'lucide-react';
import Image from 'next/image';
import { getAdminDb } from '../lib/firebaseAdmin';
import VerifiedBadge from '../components/VerifiedBadge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let trendingPosts: any[] = [];
  let latestPosts: any[] = [];
  let profileSettings: any = null;

  try {
    const db = getAdminDb();
    if (db) {
      const profileSnap = await db.collection('settings').doc('profile').get();
      if (profileSnap.exists) {
        profileSettings = profileSnap.data();
      }

      const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').limit(10).get();
      latestPosts = snapshot.docs.map(doc => {
        const data = doc.data();
        const postData = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : 
            (data.createdAt?._seconds ? data.createdAt._seconds * 1000 : data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().getTime() : 
            (data.updatedAt?._seconds ? data.updatedAt._seconds * 1000 : data.updatedAt)
        };
        return JSON.parse(JSON.stringify(postData));
      });
      trendingPosts = [...latestPosts].sort((a,b) => ((b.viewsCount || 0) + (b.reactionsCount || 0)) - ((a.viewsCount || 0) + (a.reactionsCount || 0))).slice(0, 5);
    }
  } catch (err) {
    console.error("Failed to fetch posts:", err);
  }

  return (
    <div className="flex flex-col relative overflow-hidden bg-[#050505] min-h-screen pb-20 sm:pb-0">
      {(profileSettings?.heroUrl || profileSettings?.mobileHeroUrl) ? (
        <>
          <div className="absolute top-0 inset-x-0 h-[500px] sm:h-[600px] pointer-events-none">
            {profileSettings.heroUrl && profileSettings.mobileHeroUrl ? (
              <>
                <Image src={profileSettings.mobileHeroUrl} fill style={{ objectPosition: profileSettings.mobileHeroPosition || 'center' }} className="object-cover opacity-60 sm:hidden" alt="Hero Mobile" priority unoptimized />
                <Image src={profileSettings.heroUrl} fill style={{ objectPosition: profileSettings.heroPosition || 'center' }} className="object-cover opacity-60 hidden sm:block" alt="Hero Desktop" priority unoptimized />
              </>
            ) : (
                <Image src={profileSettings.heroUrl || profileSettings.mobileHeroUrl} fill style={{ objectPosition: profileSettings.heroPosition || profileSettings.mobileHeroPosition || 'center' }} className="object-cover opacity-60" alt="Hero" priority unoptimized />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]"></div>
          </div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ccff00]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
        </>
      ) : (
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ccff00]/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
      )}
      
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
            <Image src="https://i.pravatar.cc/100?img=11" alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full border border-[#050505] object-cover"/>
            <Image src="https://i.pravatar.cc/100?img=12" alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full border border-[#050505] object-cover"/>
            <Image src="https://i.pravatar.cc/100?img=13" alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full border border-[#050505] object-cover"/>
            <Image src="https://i.pravatar.cc/100?img=14" alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full border border-[#050505] object-cover"/>
          </div>
          <div className="flex flex-col items-start justify-center gap-0">
             <span className="font-bold text-white text-[13px] leading-tight">12.7K+</span>
             <span className="text-white/50 text-[10px] m-0 leading-tight">Active Supporters</span>
          </div>
        </div>
      </div>
      
      {/* Ticker Tape Marquee */}
      <div className="w-full bg-[#ccff00] text-black overflow-hidden py-2.5 relative z-10 -rotate-1 scale-[1.02] sm:rotate-0 sm:scale-100 flex shadow-[0_0_20px_rgba(204,255,0,0.15)] mb-10 border-y border-black/20">
         <div className="flex w-[200%] animate-marquee">
           <div className="flex-1 flex justify-around items-center whitespace-nowrap font-extrabold text-[13px] uppercase tracking-widest gap-8 pr-8">
              <span className="flex items-center gap-2"><Flame className="w-4 h-4" strokeWidth={3} /> Breaking News</span>
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" strokeWidth={3} /> Viral Roasts</span>
              <span className="flex items-center gap-2"><Megaphone className="w-4 h-4" strokeWidth={3} /> Uncensored Opinions</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" strokeWidth={3} /> Youth Voice</span>
              <span className="flex items-center gap-2"><Flame className="w-4 h-4" strokeWidth={3} /> Breaking News</span>
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" strokeWidth={3} /> Viral Roasts</span>
              <span className="flex items-center gap-2"><Megaphone className="w-4 h-4" strokeWidth={3} /> Uncensored Opinions</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" strokeWidth={3} /> Youth Voice</span>
           </div>
           <div className="flex-1 flex justify-around items-center whitespace-nowrap font-extrabold text-[13px] uppercase tracking-widest gap-8 pr-8">
              <span className="flex items-center gap-2"><Flame className="w-4 h-4" strokeWidth={3} /> Breaking News</span>
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" strokeWidth={3} /> Viral Roasts</span>
              <span className="flex items-center gap-2"><Megaphone className="w-4 h-4" strokeWidth={3} /> Uncensored Opinions</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" strokeWidth={3} /> Youth Voice</span>
              <span className="flex items-center gap-2"><Flame className="w-4 h-4" strokeWidth={3} /> Breaking News</span>
              <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" strokeWidth={3} /> Viral Roasts</span>
              <span className="flex items-center gap-2"><Megaphone className="w-4 h-4" strokeWidth={3} /> Uncensored Opinions</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" strokeWidth={3} /> Youth Voice</span>
           </div>
         </div>
      </div>
      
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 text-left pb-6 relative z-10 pt-4">
        <div className="flex w-full overflow-x-auto gap-4 hide-scrollbar pb-8">
          <Link href="/category/Trending" className="shrink-0 flex gap-4 text-left p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all items-center backdrop-blur-sm group">
            <div className="w-12 h-12 rounded-full bg-[#ccff00]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-[#ccff00]" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-white font-bold text-sm leading-tight mb-1.5">Trending Roasts</h3>
              <p className="text-white/50 text-xs leading-tight flex items-center pr-2 relative w-[140px]">Viral takes that<br/>speak truth.<ChevronRight className="w-3.5 h-3.5 absolute right-0 bottom-0 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" /></p>
            </div>
          </Link>
          <Link href="/category/Politics" className="shrink-0 flex gap-4 text-left p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all items-center backdrop-blur-sm group">
            <div className="w-12 h-12 rounded-full bg-[#ccff00]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Newspaper className="w-6 h-6 text-[#ccff00]" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-white font-bold text-sm leading-tight mb-1.5">Unfiltered News</h3>
              <p className="text-white/50 text-xs leading-tight flex items-center pr-2 relative w-[140px]">News that mainstream<br/>won't show you.<ChevronRight className="w-3.5 h-3.5 absolute right-0 bottom-0 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" /></p>
            </div>
          </Link>
          <Link href="/category/Youth%20Voice" className="shrink-0 flex gap-4 text-left p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all items-center backdrop-blur-sm group">
            <div className="w-12 h-12 rounded-full bg-[#ccff00]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-[#ccff00]" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-white font-bold text-sm leading-tight mb-1.5">Youth Voice</h3>
              <p className="text-white/50 text-xs leading-tight flex items-center pr-2 relative w-[140px]">Stories, opinions &amp;<br/>voices that matter.<ChevronRight className="w-3.5 h-3.5 absolute right-0 bottom-0 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" /></p>
            </div>
          </Link>
        </div>

        {trendingPosts.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6 mt-6 px-4 sm:px-0">
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
            <div className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-5 pb-10 px-4 sm:px-0">
              {trendingPosts.map((post) => (
                <Link key={`trending-${post.id}`} href={`/post/${post.id}`} className="flex flex-col snap-start shrink-0 w-[280px] sm:w-[320px] rounded-[30px] overflow-hidden bg-[#0c0c0c] border border-white/5 relative group cursor-pointer hover:border-[#ccff00]/30 transition-all duration-500">
                  <div className="w-full relative aspect-[4/3] sm:aspect-square bg-[#050505] overflow-hidden shrink-0">
                    <div className="absolute top-4 left-4 bg-[#ccff00] text-black text-[10px] uppercase font-black px-3 py-1.5 rounded-full z-20 shadow-md flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" /> Trending
                    </div>
                    {(post.imageUrls?.[0] || post.imageUrl || post.heroUrl) && (
                      <Image src={post.imageUrls?.[0] || post.imageUrl || post.heroUrl} fill sizes="(max-width: 640px) 280px, 320px" className="object-cover w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700" alt={post.title} referrerPolicy="no-referrer" unoptimized />
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1 items-start text-left bg-[#0c0c0c] justify-between">
                    <div className="flex items-center gap-2 mb-3">
                         <span className="font-bold text-white/70 text-[11px] tracking-wide flex items-center overflow-hidden shrink-0">
                            {profileSettings?.avatarUrl ? (
                              <img src={profileSettings.avatarUrl} alt="Author" className="w-[18px] h-[18px] rounded-full object-cover border border-[#ccff00]/30 mr-1.5" />
                            ) : (
                              <span className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#ccff00]/20 to-transparent border border-[#ccff00]/40 flex items-center justify-center mr-1.5">
                                <Flame className="w-2.5 h-2.5 text-[#ccff00]" />
                              </span>
                            )}
                            {profileSettings?.username?.toUpperCase() || 'CJP MEDIA'} <VerifiedBadge className="w-3 h-3 ml-1" />
                         </span>
                    </div>
                    <h3 className="font-extrabold text-white text-[18px] sm:text-[20px] leading-snug mb-5 line-clamp-3 group-hover:text-[#ccff00] transition-colors">{post.title}</h3>
                    <div className="flex items-center justify-between w-full text-white/50 text-[12px] font-bold mt-auto">
                      <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-[#ccff00]/70" /> {post.viewsCount || 0} views</span>
                      <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> {post.reactionsCount || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {latestPosts.length > 0 && (
          <div className="mt-8 text-left pb-16 px-4 sm:px-0">
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
              {/* Featured Post (Largest) */}
              {latestPosts[0] && (
                <Link href={`/post/${latestPosts[0].id}`} className="lg:col-span-8 flex flex-col h-full rounded-[32px] overflow-hidden bg-[#0c0c0c] border border-white/5 relative group cursor-pointer hover:border-white/15 transition-all">
                  <div className="h-[300px] sm:h-[400px] lg:h-full w-full relative shrink-0">
                    <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[10px] uppercase font-bold px-4 py-2 rounded-full z-10 shadow-sm flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>
                       Just In
                    </div>
                    {(latestPosts[0].imageUrls?.[0] || latestPosts[0].imageUrl || latestPosts[0].heroUrl) && (
                      <Image src={latestPosts[0].imageUrls?.[0] || latestPosts[0].imageUrl || latestPosts[0].heroUrl} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700" alt={latestPosts[0].title} referrerPolicy="no-referrer" unoptimized />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent pointer-events-none z-10"></div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 flex flex-col items-start z-20">
                      <div className="flex items-center gap-3 mb-4">
                        {profileSettings?.avatarUrl ? (
                           <div className="w-8 h-8 rounded-full overflow-hidden relative border border-[#ccff00]/50 shrink-0 shadow-[0_0_8px_rgba(204,255,0,0.3)] ring-1 ring-[#ccff00]/20">
                             <Image src={profileSettings.avatarUrl} fill className="object-cover" alt="Author" unoptimized />
                           </div>
                        ) : (
                           <div className="bg-gradient-to-br from-[#ccff00]/20 to-transparent w-8 h-8 rounded-full shrink-0 flex items-center justify-center border border-[#ccff00]/40 shadow-[0_0_8px_rgba(204,255,0,0.3)] ring-1 ring-[#ccff00]/20">
                             <Flame className="w-4 h-4 text-[#ccff00]" />
                           </div>
                        )}
                        <span className="font-extrabold text-white text-[14px] tracking-wide flex items-center">{profileSettings?.username || 'CJP Media'} <VerifiedBadge /></span>
                        <span className="text-white/40 text-[12px] font-bold">•</span>
                        <span className="text-white/50 text-[12px] font-bold">{new Date(latestPosts[0].createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                        {latestPosts[0].tags && latestPosts[0].tags.slice(0, 2).map((tag: string, idx: number) => (
                           <span key={idx} className="hidden sm:inline-flex items-center gap-2">
                             <span className="text-white/40 text-[12px] font-bold">•</span>
                             <span className="text-[#ccff00] bg-[#ccff00]/10 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">{tag.replace(/^#/, '')}</span>
                           </span>
                        ))}
                      </div>
                      <h3 className="font-extrabold text-white text-[24px] sm:text-[32px] lg:text-[40px] leading-[1.1] mb-4 group-hover:text-[#ccff00] transition-colors drop-shadow-lg max-w-3xl">{latestPosts[0].title}</h3>
                      <p className="text-white/60 text-[15px] sm:text-[17px] leading-relaxed line-clamp-2 md:line-clamp-3 font-medium max-w-2xl hidden sm:block" dangerouslySetInnerHTML={{ __html: latestPosts[0].content?.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...' || '' }}></p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Next Two Posts (Stacked) */}
              <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
                {latestPosts.slice(1, 3).map(post => (
                   <Link key={`latest-${post.id}`} href={`/post/${post.id}`} className="flex flex-col sm:flex-row lg:flex-col gap-0 rounded-[28px] overflow-hidden bg-[#0c0c0c] border border-white/5 group relative cursor-pointer hover:border-white/15 transition-all">
                     <div className="w-full sm:w-[240px] lg:w-full relative shrink-0 overflow-hidden bg-[#050505] aspect-video sm:aspect-square md:aspect-[4/3] lg:aspect-video">
                        {(post.imageUrls?.[0] || post.imageUrl || post.heroUrl) && (
                          <Image src={post.imageUrls?.[0] || post.imageUrl || post.heroUrl} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 240px, 33vw" className="object-cover w-full h-full opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700 absolute inset-0" alt={post.title} referrerPolicy="no-referrer" unoptimized />
                        )}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 text-white/90 text-[10px] uppercase font-bold px-3 py-1.5 rounded-full z-10 shadow-sm">
                          {new Date(post.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </div>
                     </div>
                     <div className="flex flex-col flex-1 justify-center p-6 bg-[#0c0c0c] z-20 relative">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-white/70 text-[11px] tracking-wide flex items-center overflow-hidden">
                             {profileSettings?.avatarUrl ? (
                               <img src={profileSettings.avatarUrl} alt="Author" className="w-[18px] h-[18px] rounded-full object-cover border border-[#ccff00]/30 mr-2" />
                             ) : (
                               <span className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#ccff00]/20 to-transparent border border-[#ccff00]/40 flex items-center justify-center mr-2">
                                 <Flame className="w-2.5 h-2.5 text-[#ccff00]" />
                               </span>
                             )}
                             {profileSettings?.username?.toUpperCase() || 'CJP MEDIA'} <VerifiedBadge className="w-3 h-3 ml-1" />
                          </span>
                          {post.tags && post.tags.slice(0, 2).map((tag: string, idx: number) => (
                            <span key={idx} className="flex items-center gap-2">
                              <span className="text-white/20 text-[10px]">•</span>
                              <span className="text-[#ccff00] text-[10px] font-black uppercase tracking-wider">{tag.replace(/^#/, '')}</span>
                            </span>
                          ))}
                        </div>
                        <h3 className="font-extrabold text-white text-[17px] sm:text-[18px] leading-tight mb-3 group-hover:text-[#ccff00] transition-colors line-clamp-3 md:line-clamp-2">{post.title}</h3>
                        <div className="flex items-center gap-4 text-white/30 text-[12px] font-bold mt-auto lg:hidden xl:flex">
                          <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {post.viewsCount || 0}</span>
                        </div>
                     </div>
                   </Link>
                ))}
              </div>
            </div>

            {/* Bottom Row List */}
            {latestPosts.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {latestPosts.slice(3, 7).map((post) => (
                  <Link key={`latest-${post.id}`} href={`/post/${post.id}`} className="flex gap-4 sm:gap-5 block bg-transparent group relative cursor-pointer p-4 rounded-[24px] border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-colors">
                    <div className="w-[100px] sm:w-[140px] h-[100px] sm:h-[120px] rounded-[16px] overflow-hidden shrink-0 bg-[#0c0c0c] relative">
                      {(post.imageUrls?.[0] || post.imageUrl || post.heroUrl) && (
                        <Image src={post.imageUrls?.[0] || post.imageUrl || post.heroUrl} fill sizes="140px" className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700" alt={post.title} referrerPolicy="no-referrer" unoptimized />
                      )}
                    </div>
                    <div className="flex flex-col flex-1 justify-center py-1">
                      <div className="flex items-center gap-2 mb-2 line-clamp-1">
                          <span className="font-bold text-white/70 text-[11px] tracking-wide flex items-center overflow-hidden shrink-0">
                             {profileSettings?.avatarUrl ? (
                               <img src={profileSettings.avatarUrl} alt="Author" className="w-3.5 h-3.5 rounded-full object-cover border border-[#ccff00]/30 mr-1.5" />
                             ) : (
                               <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#ccff00]/20 to-transparent border border-[#ccff00]/40 flex items-center justify-center mr-1.5">
                                 <Flame className="w-2 h-2 text-[#ccff00]" />
                               </span>
                             )}
                             {profileSettings?.username?.toUpperCase() || 'CJP MEDIA'} <VerifiedBadge className="w-3 h-3 ml-1" />
                          </span>
                        <span className="text-white/40 text-[11px] font-bold">{new Date(post.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                        {post.tags && post.tags.slice(0, 2).map((tag: string, idx: number) => (
                           <span key={idx} className="flex items-center gap-2">
                             <span className="text-white/20 text-[10px]">•</span>
                             <span className="text-[#ccff00]/60 text-[10px] font-black uppercase tracking-wider">{tag.replace(/^#/, '')}</span>
                           </span>
                        ))}
                      </div>
                      <h3 className="font-extrabold text-white text-[15px] sm:text-[17px] leading-tight mb-2 group-hover:text-[#ccff00] transition-colors line-clamp-3">{post.title}</h3>
                      <div className="flex items-center gap-4 text-white/30 text-[12px] font-bold mt-auto hidden sm:flex">
                        <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {post.viewsCount || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
