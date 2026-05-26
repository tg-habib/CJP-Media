import Link from 'next/link';
import { Flame, ArrowRight, TrendingUp, Newspaper, Users, Eye, Heart, MessageCircle, ChevronRight, Megaphone } from 'lucide-react';
import Image from 'next/image';
import { getAdminDb } from '../lib/firebaseAdmin';

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
      trendingPosts = [...latestPosts].sort((a,b) => ((b.views || 0) + (b.likes || 0)) - ((a.views || 0) + (a.likes || 0))).slice(0, 5);
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121212] border border-white/5 mb-6 backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ccff00]"></span>
          </span>
          <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Join the Movement</span>
        </div>
        
        <h1 className="text-[44px] sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05] mb-5 pr-8">
          Voice of the <span className="text-[#ccff00]">Real<br />Majority.</span>
        </h1>
        
        <p className="text-[13px] sm:text-xl text-white/70 max-w-[260px] sm:max-w-xl font-medium mb-8 leading-relaxed">
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
      
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 text-left pb-6 relative z-10">
        <div className="flex w-full overflow-x-auto gap-3 hide-scrollbar pb-8">
          <Link href="/category/Trending" className="shrink-0 flex gap-3 text-left p-4 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition items-center">
            <TrendingUp className="w-6 h-6 text-[#ccff00] shrink-0" />
            <div className="flex flex-col">
              <h3 className="text-white font-bold text-[13px] leading-tight mb-1">Trending Roasts</h3>
              <p className="text-white/40 text-[10px] leading-tight flex items-center pr-2 relative w-[130px]">Viral takes that<br/>speak truth.<ChevronRight className="w-3 h-3 absolute right-0 bottom-0 text-white/30" /></p>
            </div>
          </Link>
          <Link href="/category/Politics" className="shrink-0 flex gap-3 text-left p-4 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition items-center">
            <Newspaper className="w-6 h-6 text-[#ccff00] shrink-0" />
            <div className="flex flex-col">
              <h3 className="text-white font-bold text-[13px] leading-tight mb-1">Unfiltered News</h3>
              <p className="text-white/40 text-[10px] leading-tight flex items-center pr-2 relative w-[130px]">News that mainstream<br/>won't show you.<ChevronRight className="w-3 h-3 absolute right-0 bottom-0 text-white/30" /></p>
            </div>
          </Link>
          <Link href="/category/Youth%20Voice" className="shrink-0 flex gap-3 text-left p-4 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition items-center">
            <Users className="w-6 h-6 text-[#ccff00] shrink-0" />
            <div className="flex flex-col">
              <h3 className="text-white font-bold text-[13px] leading-tight mb-1">Youth Voice</h3>
              <p className="text-white/40 text-[10px] leading-tight flex items-center pr-2 relative w-[130px]">Stories, opinions &amp;<br/>voices that matter.<ChevronRight className="w-3 h-3 absolute right-0 bottom-0 text-white/30" /></p>
            </div>
          </Link>
        </div>

        {trendingPosts.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4 mt-2 px-4 sm:px-0">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#ccff00]" />
                <h2 className="text-white font-bold text-[17px]">Trending Now</h2>
              </div>
              <Link href="/category/Trending" className="flex items-center gap-1 text-[#ccff00] text-xs font-semibold hover:underline">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-12 px-4 sm:px-0">
              {trendingPosts.map((post) => (
                <Link key={`trending-${post.id}`} href={`/post/${post.id}`} className="snap-start shrink-0 w-[240px] rounded-2xl overflow-hidden bg-[#121212] border border-white/5 relative group cursor-pointer block">
                  <div className="h-[200px] w-full relative">
                    <div className="absolute top-3 left-3 bg-[#1a1a1a]/80 text-[#ccff00] text-[9px] font-bold px-2 py-0.5 rounded-full z-10 backdrop-blur-md">Trending</div>
                    {(post.imageUrls?.[0] || post.imageUrl || post.heroUrl) && (
                      <Image src={post.imageUrls?.[0] || post.imageUrl || post.heroUrl} fill sizes="240px" className="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-500" alt={post.title} referrerPolicy="no-referrer" unoptimized />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/20 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-2 left-3 right-3 flex items-center gap-3 text-white/90 text-[10px] font-semibold z-10 drop-shadow-md">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.views || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes || 0}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {(post.comments || []).length}</span>
                    </div>
                  </div>
                  <div className="p-4 pt-2 flex flex-col items-start text-left h-[80px]">
                    <h3 className="font-bold text-white text-[14px] leading-snug mb-2 line-clamp-2">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {latestPosts.length > 0 && (
          <div className="mt-2 text-left pb-12 px-4 sm:px-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#ccff00]" />
                <h2 className="text-white font-bold text-[17px]">Latest Updates</h2>
              </div>
              <Link href="/feed" className="flex items-center gap-1 text-[#ccff00] text-xs font-semibold hover:underline">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="flex flex-col gap-4">
              {latestPosts.slice(0, 3).map((post) => (
                <Link key={`latest-${post.id}`} href={`/post/${post.id}`} className="block bg-[#121212]/50 rounded-2xl border border-white/5 p-4 relative cursor-pointer group hover:bg-[#121212] transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#ccff00]/10 w-9 h-9 rounded-full shrink-0 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-[#ccff00]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-[13px]">CJP Media</span>
                      <span className="text-white/40 text-[10px]">{new Date(post.createdAt?.toDate ? post.createdAt.toDate() : post.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                       <p className="text-white/80 text-[13px] leading-relaxed line-clamp-3">{post.title}</p>
                       {post.tags && post.tags.length > 0 && (
                         <div className="flex gap-2 items-center text-[10px] uppercase font-bold text-[#ccff00]">
                            {post.tags.slice(0, 2).map((t: string) => <span key={t}>{t.replace(/^#/, '')}</span>)}
                         </div>
                       )}
                    </div>
                    {(post.imageUrls?.[0] || post.imageUrl || post.heroUrl) && (
                      <div className="w-[120px] h-[80px] rounded-xl overflow-hidden shrink-0 bg-white/5 relative">
                        <Image src={post.imageUrls?.[0] || post.imageUrl || post.heroUrl} fill sizes="120px" className="object-cover opacity-80" alt={post.title} referrerPolicy="no-referrer" unoptimized />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
