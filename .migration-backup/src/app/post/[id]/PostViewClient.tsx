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
import VerifiedBadge from '../../../components/VerifiedBadge';

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
    
    // Increment view count exactly once per load on client
    const incrementView = async () => {
      try {
        const postRef = doc(db, 'posts', id);
        await updateDoc(postRef, {
          viewsCount: increment(1)
        });
      } catch (err) {
        console.error("Failed to increment views:", err);
      }
    };
    incrementView();

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

  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    if (!user) {
      toast.error("Please login to save posts");
      return;
    }
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed from saved posts" : "Saved to your bookmarks");
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
       const date = typeof post.createdAt.toDate === 'function' ? post.createdAt.toDate() : new Date(post.createdAt);
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
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/profile" className="w-[48px] h-[48px] shrink-0 relative overflow-hidden rounded-full border border-[#ccff00]/50 flex items-center justify-center bg-gradient-to-br from-[#ccff00]/20 to-transparent hover:border-[#ccff00]/80 transition-colors shadow-[0_0_12px_rgba(204,255,0,0.3)] ring-2 ring-[#ccff00]/20 ring-offset-2 ring-offset-[#0a0a0a]">
               {pAvatarUrl ? (
                 <Image src={pAvatarUrl} alt={pName} fill className="object-cover" />
               ) : (
                 <Flame className="w-[24px] h-[24px] text-[#ccff00]" strokeWidth={2.5} />
               )}
             </Link>
             
             <div className="flex flex-col">
                <Link href="/profile" className="flex items-center hover:text-[#ccff00] transition">
                   <span className="font-bold text-white text-[16px] tracking-tight leading-none">{pName}</span>
                   <VerifiedBadge className="w-5 h-5 ml-1 drop-shadow-[0_0_4px_rgba(204,255,0,0.5)]" />
                </Link>
                <div className="text-[13px] text-white/40 flex items-center gap-1.5 mt-1 font-medium">
                   <span>{timeAgo}</span>
                   <span className="text-[10px]">•</span>
                   <Globe className="w-3.5 h-3.5" />
                   <span>Public</span>
                </div>
             </div>
          </div>
          <button onClick={toggleFollow} className={`h-9 px-5 rounded-full border font-bold text-[13px] transition-all hover:scale-105 active:scale-95 ${isFollowing ? 'border-white/20 text-white bg-white/10' : 'border-[#ccff00] text-black bg-[#ccff00] hover:bg-[#bbe600]'}`}>
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
        <div className="px-5 py-5 border-b border-white/[0.03]">
          <h1 className="text-[26px] sm:text-[30px] font-extrabold text-white leading-[1.2] mb-4 tracking-tight">
            {post.title}
          </h1>
          <p className="text-[16px] sm:text-[18px] text-white/70 italic font-serif leading-relaxed">
            "{post.roast || "Cockroach Janta Party Official Logo CJP a Voice of unemployed youth"}"
          </p>
        </div>

        {/* Tags */}
        <div className="px-5 py-4 flex flex-wrap items-center gap-2 border-b border-white/[0.03]">
           <Link href={`/category/${post.category || 'Politics'}`} className="bg-[#ccff00]/10 text-[#ccff00] text-[12px] uppercase font-black tracking-wide px-4 py-2 rounded-full line-clamp-1 hover:bg-[#ccff00]/20 transition-colors">
              {post.category || "Politics"}
           </Link>
           {post.tags && post.tags.map((tag: string, index: number) => (
             <span key={index} className="bg-white/5 text-white/70 text-[12px] uppercase font-black tracking-wide px-4 py-2 rounded-full line-clamp-1">
               {tag.replace(/^#/, '')}
             </span>
           ))}
        </div>

        {/* Stats Row */}
        <div className="px-6 py-6 flex items-center justify-between border-b border-white/5 bg-[#121212]/30">
           <div className="flex flex-col items-center gap-1">
             <span className="text-white font-extrabold text-[17px] tracking-tight">{post.viewsCount || 0}</span>
             <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Views</span>
           </div>
           <div className="flex flex-col items-center gap-1">
             <span className="text-[#ff3366] font-extrabold text-[17px] tracking-tight">{localReactionsCount}</span>
             <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Likes</span>
           </div>
           <div className="flex flex-col items-center gap-1">
             <span className="text-[#33ccff] font-extrabold text-[17px] tracking-tight">{post.commentsCount || 0}</span>
             <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Comments</span>
           </div>
           <div className="flex flex-col items-center gap-1">
             <span className="text-[#ccff00] font-extrabold text-[17px] tracking-tight">{post.sharesCount || 0}</span>
             <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Shares</span>
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
           <button onClick={handleBookmark} className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-colors ${isBookmarked ? 'hover:bg-[#ccff00]/10 text-[#ccff00]' : 'hover:bg-white/5 text-white/60'}`}>
              <Bookmark className={`w-[18px] h-[18px] ${isBookmarked ? 'text-[#ccff00] fill-[#ccff00]' : ''}`} strokeWidth={2} />
              <span className="text-[13px] font-semibold">{isBookmarked ? "Saved" : "Save"}</span>
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

