"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, auth, loginWithGoogle } from '../../../firebase';
import { ArrowLeft, MoreVertical, MessageCircle, Share2, Bookmark, Flame, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { useAuthState } from 'react-firebase-hooks/auth';
import { formatDistanceToNow } from 'date-fns';
import CommentsSection from '../../../components/CommentsSection';
import { useFollow } from '../../../hooks/useFollow';
import { toast } from 'sonner';

const VerifiedBadge = () => (
  <svg className="w-[15px] h-[15px] text-[#1d9bf0] ml-1" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.748 1.838 3.447-.075.313-.118.636-.118.97 0 2.21 1.71 4 3.918 4 .51 0 1-.097 1.454-.275C9.176 21.6 10.495 22.5 12 22.5c1.505 0 2.824-.9 3.348-2.275.456.178.945.275 1.454.275 2.21 0 3.918-1.79 3.918-4 0-.334-.043-.656-.118-.97 1.098-.7 1.838-1.987 1.838-3.447z" />
    <path fill="#fff" d="M10.458 15.65c-.24 0-.48-.09-.66-.27l-2.45-2.45c-.36-.36-.36-.95 0-1.32.36-.36.95-.36 1.32 0l1.79 1.79 4.14-4.14c.36-.36.95-.36 1.32 0 .36.36.36.95 0 1.32l-4.8 4.8c-.18.18-.42.27-.66.27z" />
  </svg>
);

export default function PostViewClient({ id, initialPost, profile }: { id: string, initialPost: any, profile?: any }) {
  const router = useRouter();
  const [post, setPost] = useState<any>(initialPost);
  const [user] = useAuthState(auth);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [hasLiked, setHasLiked] = useState(false);
  const [localReactionsCount, setLocalReactionsCount] = useState(post?.reactionsCount || 0);
  const [copied, setCopied] = useState(false);

  const pName = profile?.name || 'CJP Media';
  const pAvatarUrl = profile?.avatarUrl;

  const { isFollowing, toggleFollow } = useFollow();

  useEffect(() => {
    window.scrollTo(0,0);
    if (!id) return;
    const unsubPost = onSnapshot(doc(db, 'posts', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPost({ id: docSnap.id, ...data });
        if (data.reactionsCount !== undefined) setLocalReactionsCount(data.reactionsCount);
      } else {
        router.push('/');
      }
    });
    return () => unsubPost();
  }, [id, router]);

  useEffect(() => {
    if (!user || !id) return;
    const unsub = onSnapshot(doc(db, `posts/${id}/reactions`, user.uid), (docSnap) => {
      setHasLiked(docSnap.exists());
    });
    return () => unsub();
  }, [user, id]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const index = Math.round(scrollLeft / width);
    if (index !== currentImageIndex) {
      setCurrentImageIndex(index);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please log in to like posts");
      return loginWithGoogle();
    }
    const reactionRef = doc(db, `posts/${id}/reactions`, user.uid);
    const postRef = doc(db, `posts/${id}`);
    
    try {
      if (hasLiked) {
        setHasLiked(false);
        setLocalReactionsCount((prev: number) => Math.max(0, prev - 1));
        await deleteDoc(reactionRef);
        await updateDoc(postRef, { reactionsCount: increment(-1) });
      } else {
        setHasLiked(true);
        setLocalReactionsCount((prev: number) => prev + 1);
        await setDoc(reactionRef, {
          userId: user.uid,
          createdAt: serverTimestamp()
        });
        await updateDoc(postRef, { reactionsCount: increment(1) });
      }
    } catch (e) {
      console.error("Error toggling like", e);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out "${post.title}" on CJP Media`,
          url: shareUrl,
        });
        await updateDoc(doc(db, `posts/${id}`), { sharesCount: increment(1) });
        toast.success("Shared successfully!");
      } catch (err) {
         console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      await updateDoc(doc(db, `posts/${id}`), { sharesCount: increment(1) });
      toast.success("Link copied to clipboard!");
    }
  };

  const focusComment = () => {
    const commentInput = document.getElementById('comment-input');
    if (commentInput) {
      commentInput.focus();
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
         <div className="w-8 h-8 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const images = post.imageUrls?.length > 0 ? post.imageUrls : (post.image || post.imageUrl || post.heroUrl || post.coverImage ? [post.image || post.imageUrl || post.heroUrl || post.coverImage] : []);
  const hasMultiple = images.length > 1;

  let timeAgo = "2h ago";
  if (post.createdAt) {
     try {
       const date = typeof post.createdAt.toDate === 'function' ? post.createdAt.toDate() : post.createdAt;
       timeAgo = formatDistanceToNow(date, { addSuffix: true }).replace("about ", "");
     } catch (e) {}
  }

  return (
    <div className="flex justify-center min-h-screen bg-[#0a0a0a]">
      <div className="w-full max-w-[1240px] flex justify-center lg:justify-between gap-0 lg:gap-8 px-0 lg:px-4">
        
        {/* Left Sidebar (Desktop Only) */}
        <div className="hidden lg:flex flex-col w-[260px] sticky top-0 h-screen shrink-0 border-r border-white/5 py-4 pr-6">
          <nav className="flex flex-col gap-2">
             <Link href="/" className="flex items-center gap-4 py-3 px-4 rounded-full hover:bg-white/5 text-white/70 transition w-fit">
               <Globe className="w-6 h-6" />
               <span className="text-xl">Feed</span>
             </Link>
             <Link href="/" className="flex items-center gap-4 py-3 px-4 rounded-full hover:bg-white/5 text-white/70 transition w-fit">
               <Flame className="w-6 h-6" />
               <span className="text-xl">Trending</span>
             </Link>
             <Link href="/" className="flex items-center gap-4 py-3 px-4 rounded-full hover:bg-white/5 text-white/70 transition w-fit">
               <MessageCircle className="w-6 h-6" />
               <span className="text-xl">Discussions</span>
             </Link>
             <Link href="/" className="flex items-center gap-4 py-3 px-4 rounded-full hover:bg-white/5 text-white/70 transition w-fit">
               <Bookmark className="w-6 h-6" />
               <span className="text-xl">Saved</span>
             </Link>
          </nav>
          <button className="bg-[#ccff00] text-black font-bold text-lg rounded-full py-3.5 mt-6 hover:bg-[#bbe600] transition shadow-[0_0_15px_rgba(204,255,0,0.2)]">
            Create Post
          </button>
        </div>

        {/* Main Feed Container */}
        <div className="w-full max-w-xl mx-auto lg:mx-0 shrink-0 border-x border-transparent lg:border-white/5 min-h-screen bg-[#0a0a0a]">
          
          {/* Top Navigation Bar */}
          <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-50 flex items-center justify-between px-4 h-14 border-b border-white/5">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors -ml-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white font-semibold text-[17px]">Post</h1>
            <button className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors -mr-2">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full pb-20">
        {/* Profile Row */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Link href="/profile" className="w-[36px] h-[36px] shrink-0 relative overflow-hidden rounded-full border border-[#ccff00]/20 flex items-center justify-center bg-[#4d6600] hover:scale-105 transition-transform">
               {pAvatarUrl ? (
                 <Image src={pAvatarUrl} alt={pName} fill className="object-cover" />
               ) : (
                 <Flame className="w-[18px] h-[18px] text-[#ccff00]" strokeWidth={2.5} />
               )}
             </Link>
             
             <div className="flex flex-col">
                <Link href="/profile" className="flex items-center hover:text-[#ccff00] transition">
                   <span className="font-bold text-white text-[15px] leading-none">{pName}</span>
                   <VerifiedBadge />
                </Link>
                <div className="text-[13px] text-white/50 flex items-center gap-1 mt-1">
                   <span>{timeAgo}</span>
                   <span className="text-[10px]">•</span>
                   <Globe className="w-3.5 h-3.5" />
                   <span>Public</span>
                </div>
             </div>
          </div>
          <button onClick={toggleFollow} className={`h-8 px-4 rounded-full border font-bold text-[13px] transition-colors ${isFollowing ? 'border-white/20 text-white bg-white/10' : 'border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00]/10'}`}>
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Media Container */}
        <div className="w-full relative bg-[#080808]">
          <div className="w-full aspect-square relative border-y border-white/5">
             <div 
               ref={scrollContainerRef}
               className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
               onScroll={handleScroll}
             >
                {images.map((img: string, i: number) => (
                   <div key={i} className="w-full h-full shrink-0 snap-center relative">
                     <Image 
                       src={img || 'https://picsum.photos/seed/placeholder/800/800'} 
                       alt={post.title} 
                       fill 
                       unoptimized
                       priority={i === 0}
                       className="object-contain"
                     />
                   </div>
                ))}
                {images.length === 0 && (
                   <div className="w-full h-full shrink-0 snap-center relative">
                     <Image 
                       src={'https://picsum.photos/seed/placeholder/800/800'} 
                       alt={post.title} 
                       fill 
                       unoptimized
                       className="object-contain"
                     />
                   </div>
                )}
             </div>

             {hasMultiple && (
               <div className="absolute top-3 right-3 bg-black/70 text-white text-[12px] font-bold px-2 py-1 rounded-md backdrop-blur-md pointer-events-none">
                 {currentImageIndex + 1}/{images.length}
               </div>
             )}
             {!hasMultiple && (
               <div className="absolute top-3 right-3 bg-black/70 text-white text-[12px] font-bold px-2 py-1 rounded-md backdrop-blur-md pointer-events-none">
                 1/1
               </div>
             )}
          </div>
          {/* Pagination Indicators beneath image, slightly overlaying or just below... design shows below */}
          <div className="flex justify-center gap-1.5 py-4 bg-[#0a0a0a]">
             {(hasMultiple ? images : Array(1).fill(0)).map((_: string, i: number) => (
               <div 
                 key={i} 
                 className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-[#557711]' : 'bg-white/20'}`}
               />
             ))}
          </div>
        </div>

        {/* Text Content */}
        <div className="px-4 pb-4 border-b border-white/[0.03]">
          <h1 className="text-[22px] sm:text-[24px] font-bold text-white leading-[1.25] mb-4">
            {post.title}
          </h1>
          <p className="text-[15px] sm:text-[16px] text-white/60 italic font-serif leading-relaxed">
            "{post.roast || "Cockroach Janta Party Official Logo CJP a Voice of unemployed youth"}"
          </p>
        </div>

        {/* Tags */}
        <div className="px-4 py-4 flex flex-wrap items-center gap-2 border-b border-white/[0.03]">
           <span className="bg-[#cc6633] text-black text-[12px] font-bold px-3 py-1.5 rounded-md">
              {post.category || "Politics"}
           </span>
           <span className="bg-[#33cc33] text-black text-[12px] font-bold px-3 py-1.5 rounded-md">Youth Voice</span>
           <span className="bg-[#3366cc] text-white text-[12px] font-bold px-3 py-1.5 rounded-md">Awareness</span>
           <span className="bg-white/10 text-white/80 text-[12px] font-bold px-3 py-1.5 rounded-md">+2</span>
        </div>

        {/* Stats Row */}
        <div className="px-4 py-5 flex items-center justify-between border-b border-white/[0.03]">
           <div className="flex flex-col items-center gap-0.5">
             <span className="text-white font-bold text-[15px]">{post.viewsCount || 0}</span>
             <span className="text-white/40 text-[12px]">Views</span>
           </div>
           <div className="flex flex-col items-center gap-0.5">
             <span className="text-white font-bold text-[15px]">{localReactionsCount}</span>
             <span className="text-white/40 text-[12px]">Likes</span>
           </div>
           <div className="flex flex-col items-center gap-0.5">
             <span className="text-white font-bold text-[15px]">{post.commentsCount || 0}</span>
             <span className="text-white/40 text-[12px]">Comments</span>
           </div>
           <div className="flex flex-col items-center gap-0.5">
             <span className="text-white font-bold text-[15px]">{post.sharesCount || 0}</span>
             <span className="text-white/40 text-[12px]">Shares</span>
           </div>
           <div className="flex flex-col items-center gap-0.5">
             <span className="text-white font-bold text-[15px]">89</span>
             <span className="text-white/40 text-[12px]">Saves</span>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-3 border-b border-white/[0.03] grid grid-cols-4 gap-1">
           <button 
             onClick={handleLike}
             className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-colors ${hasLiked ? 'hover:bg-[#ff3366]/10' : 'hover:bg-white/5 text-white/60'}`}
           >
              <Flame className={`w-[18px] h-[18px] ${hasLiked ? 'text-[#ff3366] fill-[#ff3366]' : ''}`} strokeWidth={2} />
              <span className={`text-[13px] font-semibold ${hasLiked ? 'text-[#ff3366]' : ''}`}>Like</span>
           </button>
           <button 
             onClick={focusComment}
             className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-white/5 transition-colors text-white/60"
           >
              <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
              <span className="text-[13px] font-semibold">Comment</span>
           </button>
           <button 
             onClick={handleShare}
             className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-white/5 transition-colors text-white/60"
           >
              {copied ? <Check className="w-[18px] h-[18px] text-[#ccff00]" strokeWidth={2} /> : <Share2 className="w-[18px] h-[18px]" strokeWidth={2} />}
              <span className="text-[13px] font-semibold">Share</span>
           </button>
           <button className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-white/5 transition-colors text-white/60">
              <Bookmark className="w-[18px] h-[18px]" strokeWidth={2} />
              <span className="text-[13px] font-semibold">Save</span>
           </button>
        </div>

        {/* Big Profile Card */}
        <div className="mx-4 my-6 p-4 rounded-2xl border border-white/[0.08] bg-[#121212] flex flex-col gap-4">
           <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                 <Link href="/profile" className="bg-[#4d6600] w-12 h-12 rounded-full shrink-0 flex items-center justify-center border border-[#ccff00]/20 hover:scale-105 transition-transform">
                   <Flame className="w-6 h-6 text-[#ccff00]" strokeWidth={2.5} />
                 </Link>
                 <div className="flex flex-col">
                    <Link href="/profile" className="flex items-center gap-1 hover:text-[#ccff00] transition">
                       <span className="font-bold text-white text-[16px]">CJP Media</span>
                       <VerifiedBadge />
                    </Link>
                    <span className="text-white/50 text-[13px]">127K Followers</span>
                 </div>
              </div>
           </div>
           <p className="text-white/70 text-[14px] leading-snug">
              We speak for the ignored, the unseen, and the unemployed youth.
           </p>
           <button onClick={toggleFollow} className={`w-full py-3 font-bold text-[15px] rounded-xl transition-colors mt-2 ${isFollowing ? 'bg-white/10 text-white' : 'bg-[#ccff00] text-black hover:bg-[#bbe600]'}`}>
             {isFollowing ? 'Following' : 'Follow'}
           </button>
        </div>

        {/* Real Comments Wrapper */}
        <div className="px-4 pt-2">
          <CommentsSection postId={id} initialCommentsCount={post.commentsCount} />
        </div>

          </div> {/* Closes w-full pb-20 */}
        </div> {/* Closes Main Feed Container */}

        {/* Right Sidebar (Desktop Only) */}
        <div className="hidden lg:flex flex-col w-[320px] sticky top-0 h-screen shrink-0 border-l border-white/5 py-4 pl-6 overflow-y-auto scrollbar-hide">
          {/* Who to follow */}
          <div className="bg-[#121212] rounded-2xl border border-white/5 p-4 mb-6">
            <h3 className="font-bold text-white text-lg mb-4">Who to follow</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">R</span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-bold text-white leading-tight hover:underline flex items-center gap-1">
                      {pName}
                      <VerifiedBadge />
                    </span>
                    <span className="text-white/50">@cjpmedia</span>
                  </div>
                </div>
                <button onClick={toggleFollow} className={`h-8 px-3 rounded-full font-bold text-sm transition-colors ${isFollowing ? 'bg-white/10 text-white' : 'bg-white text-black'}`}>
                   {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-[11px] text-white/40 flex flex-wrap gap-x-3 gap-y-1">
             <span>Terms of Service</span>
             <span>Privacy Policy</span>
             <span>Cookie Policy</span>
             <span>© 2026 CJP Media</span>
          </div>
        </div>

      </div>
    </div>
  );
}

