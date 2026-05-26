"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, MoreVertical, MapPin, Globe, Calendar, Mail, UserPlus, Eye, Heart, MessageCircle, ArrowRight, Flame } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFollow } from '../../hooks/useFollow';

const VerifiedBadge = () => (
  <svg className="w-[15px] h-[15px] text-[#1d9bf0] ml-1" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.748 1.838 3.447-.075.313-.118.636-.118.97 0 2.21 1.71 4 3.918 4 .51 0 1-.097 1.454-.275C9.176 21.6 10.495 22.5 12 22.5c1.505 0 2.824-.9 3.348-2.275.456.178.945.275 1.454.275 2.21 0 3.918-1.79 3.918-4 0-.334-.043-.656-.118-.97 1.098-.7 1.838-1.987 1.838-3.447z" />
    <path fill="#fff" d="M10.458 15.65c-.24 0-.48-.09-.66-.27l-2.45-2.45c-.36-.36-.36-.95 0-1.32.36-.36.95-.36 1.32 0l1.79 1.79 4.14-4.14c.36-.36.95-.36 1.32 0 .36.36.36.95 0 1.32l-4.8 4.8c-.18.18-.42.27-.66.27z" />
  </svg>
);

export default function ProfileClient({ initialPosts, profile }: { initialPosts: any[], profile: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Posts');
  const [activeFilter, setActiveFilter] = useState('Latest');

  const pName = profile?.name || 'CJP Media';
  const pHandle = profile?.handle || '@cjpmedia';
  const pBio = profile?.bio || 'We speak for the ignored, the unseen,\nand the unemployed youth.';
  const pLocation = profile?.location || 'New Delhi, India';
  const pUrl = profile?.url || 'cjpmedia.in';
  const pJoined = profile?.joined || 'Jan 2024';
  const pFollowers = profile?.followers || '127K';
  const pAvatarUrl = profile?.avatarUrl;
  const pCoverUrl = profile?.coverUrl || 'https://picsum.photos/seed/cjpbg2/1000/600';
  
  const { isFollowing, toggleFollow } = useFollow();

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
       {/* Top Nav */}
       <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-50 flex items-center justify-between px-4 h-14 border-b border-white/5">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-semibold text-[17px]">{pName}</h1>
        <div className="flex items-center gap-1 -mr-2">
           <button className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
             <Bell className="w-5 h-5" />
           </button>
           <button className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
             <MoreVertical className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto pb-20">
         {/* Banner */}
         <div className="w-full h-[180px] sm:h-[220px] relative bg-[#1a1a1a] overflow-hidden">
           <Image src={pCoverUrl} alt="Banner" fill priority className={`object-cover ${profile?.coverUrl ? 'opacity-80' : 'opacity-30 mix-blend-overlay'} unoptimized`} />
           {!profile?.coverUrl && (
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <h2 className="text-white font-bold text-[22px] tracking-tight uppercase">Voice of the</h2>
                <h1 className="text-[#ccff00] font-black text-[38px] tracking-tighter uppercase leading-[0.9]">Real Majority</h1>
                <p className="text-white/80 text-[11px] font-medium tracking-widest mt-2 uppercase">Ignored. Unseen. Unstoppable.</p>
             </div>
           )}
         </div>

         {/* Profile Info */}
         <div className="px-4 relative pb-5 border-b border-white/5">
            <div className="flex justify-between items-start">
               {/* Avatar */}
               <div className="w-[104px] h-[104px] rounded-full border-[4px] border-[#0a0a0a] bg-[#121212] -mt-[52px] relative flex items-center justify-center overflow-hidden z-10 shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                 {pAvatarUrl ? (
                   <Image src={pAvatarUrl} alt={pName} fill className="object-cover" />
                 ) : (
                   <div className="bg-[#ccff00]/5 w-full h-full flex flex-col items-center justify-center p-2 pt-3 border border-[#ccff00]/20 rounded-full">
                      <Flame className="w-[38px] h-[38px] text-[#ccff00]" strokeWidth={2.5} />
                      <span className="text-white font-bold text-[18px] leading-tight tracking-tight mt-0.5">CJP</span>
                      <span className="text-[#ccff00] font-bold text-[10px] tracking-widest leading-none">MEDIA</span>
                   </div>
                 )}
               </div>

               {/* Action Buttons */}
               <div className="flex items-center gap-2.5 mt-3">
                  <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition">
                    <Mail className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition">
                    <UserPlus className="w-5 h-5" />
                  </button>
                  <button onClick={toggleFollow} className={`font-bold text-[14px] px-6 h-10 rounded-full transition-colors ${isFollowing ? 'bg-white/10 text-white' : 'bg-[#ccff00] text-black hover:bg-[#bbe600]'}`}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
               </div>
            </div>

            <div className="mt-2 text-left">
               <div className="flex items-center gap-1">
                  <h1 className="text-[22px] font-bold text-white">{pName}</h1>
                  <VerifiedBadge />
               </div>
               <div className="flex items-center gap-2 mt-0.5">
                 <span className="text-white/50 text-[14px]">{pHandle}</span>
                 <span className="bg-white/10 text-white/70 text-[11px] px-2 py-0.5 rounded-full font-medium">Follows you</span>
               </div>
               
               <p className="text-white/80 text-[15px] mt-4 leading-snug whitespace-pre-wrap">
                 {pBio}
               </p>

               <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[13px] text-white/50">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{pLocation}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    <a href={`https://${pUrl.replace(/^https?:\/\//, '')}`} target="_blank" className="hover:underline text-white/70">{pUrl.replace(/^https?:\/\//, '')}</a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {pJoined}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Stats Row */}
         <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <div className="flex flex-col items-center">
               <span className="text-white font-bold text-[18px]">{pFollowers}</span>
               <span className="text-white/40 text-[12px] mt-0.5">Followers</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
               <span className="text-white font-bold text-[18px]">48</span>
               <span className="text-white/40 text-[12px] mt-0.5">Following</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
               <span className="text-white font-bold text-[18px]">285</span>
               <span className="text-white/40 text-[12px] mt-0.5">Posts</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
               <span className="text-white font-bold text-[18px]">1.2M</span>
               <span className="text-white/40 text-[12px] mt-0.5">Total Likes</span>
            </div>
         </div>

         {/* Mission/Support Banner */}
         <div className="mx-4 my-5">
            <div className="bg-[#121212] border border-white/10 rounded-[1.25rem] flex flex-col p-4 relative overflow-hidden">
               <div className="grid grid-cols-2 gap-4 relative z-10 w-full pl-1">
                  
                  {/* Our Mission */}
                  <div className="flex items-start gap-3 border-r border-white/10 pr-4">
                    <div className="shrink-0 mt-1">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccff00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
                         <path d="M10 5a2 2 0 1 1 4 0v5"/>
                         <path d="M14 8a2 2 0 1 1 4 0v4"/>
                         <path d="M18 11a2 2 0 1 1 4 0v5"/>
                         <path d="M6 10a2 2 0 1 1 4 0v6"/>
                         <path d="M3 15h3v7H3z"/>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#ccff00] font-medium text-[13px] mb-1 leading-snug">Our Mission</span>
                      <p className="text-white/70 text-[12px] leading-[1.35]">
                        To raise real issues, create awareness, and build a stronger voice for the youth.
                      </p>
                    </div>
                  </div>
                  
                  {/* Support */}
                  <div className="flex flex-col pl-1 justify-between">
                    <div>
                      <span className="text-[#ccff00] font-medium text-[13px] mb-1 leading-snug block">Support the Movement</span>
                      <p className="text-white/70 text-[12px] leading-[1.35]">
                        Join hands. Be the voice.
                      </p>
                    </div>
                    <button className="flex items-center justify-center gap-1.5 border border-[#ccff00]/40 hover:bg-[#ccff00]/10 rounded-full px-4 py-1 mt-2.5 transition-colors group w-max shrink-0">
                       <span className="text-[#ccff00] text-[12px] font-semibold">Join CJP</span>
                       <ArrowRight className="w-3.5 h-3.5 text-[#ccff00] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

               </div>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex border-b border-white/10 px-2 mt-2">
            {['Posts', 'Reels', 'Highlights', 'About'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`flex-1 py-3 text-[14px] font-medium relative transition-colors ${activeTab === tab ? 'text-[#ccff00]' : 'text-white/60 hover:text-white/90'}`}
               >
                 {tab}
                 {activeTab === tab && (
                    <div className="absolute bottom-0 inset-x-0 mx-auto w-[60%] h-[3px] bg-[#ccff00] rounded-t-full"></div>
                 )}
               </button>
            ))}
         </div>

         <div className="p-4 bg-[#050505]">
            {activeTab === 'Posts' && (
              <>
                 <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-4">
                    {['Latest', 'Popular', 'News', 'Politics', 'Youth Voice'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-colors ${
                          activeFilter === filter 
                           ? 'bg-[#ccff00] border-[#ccff00] text-black' 
                           : 'bg-transparent border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                 </div>

                 {/* Grid */}
                 <div className="grid grid-cols-3 gap-1.5">
                    {initialPosts.map((post, i) => (
                      <Link href={`/post/${post.id}`} key={post.id + i} className="relative aspect-[3/4] bg-[#1a1a1a] rounded-lg overflow-hidden group border border-white/5">
                         <Image src={post.imageUrls?.[0] || post.imageUrl || post.image || post.coverImage || `https://picsum.photos/seed/${post.id}/300/400`} alt={post.title || 'Post view'} fill className="object-cover group-hover:scale-105 transition-transform duration-500 unoptimized" unoptimized />
                         
                         {/* Badges/Tags */}
                         {(i === 0 || post.category === 'Pinned') && (
                           <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur text-[#ccff00] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                             <Flame className="w-2.5 h-2.5" /> Pinned
                           </div>
                         )}
                         {i !== 0 && (i === 1 || i === 2 || post.category === 'Trending') && (
                           <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                             <Flame className="w-2.5 h-2.5" /> Trending
                           </div>
                         )}

                         {/* Overlay stats */}
                         <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-6 flex items-center justify-between">
                            <div className="flex items-center gap-1 text-white/80">
                              <Eye className="w-3 h-3" />
                              <span className="text-[10px] font-medium">{post.viewsCount || '12.5K'}</span>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                              <div className="flex items-center gap-1 text-white/80">
                                <Heart className="w-3 h-3" />
                                <span className="text-[10px] font-medium">{post.reactionsCount || '256'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-white/80">
                                <MessageCircle className="w-3 h-3" />
                                <span className="text-[10px] font-medium">{post.commentsCount || '24'}</span>
                              </div>
                            </div>
                         </div>
                      </Link>
                    ))}
                 </div>

                 <button className="w-full mt-4 py-3 rounded-full bg-[#121212] hover:bg-[#1a1a1a] border border-white/5 text-white/90 font-semibold text-[14px] transition-colors">
                    View all posts
                 </button>
              </>
            )}
         </div>
         
      </div>
    </div>
  )
}
