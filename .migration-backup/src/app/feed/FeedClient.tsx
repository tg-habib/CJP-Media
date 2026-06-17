"use client";

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, onSnapshot, updateDoc, increment, setDoc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { MoreVertical, MessageCircle, Share2, Bookmark, Flame, Eye, ChevronDown, ChevronRight, Smile, Image as ImageIcon, Globe, Loader2, Link2, Copy, Check, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle } from '../../firebase';
import { formatDistanceToNow } from 'date-fns';
import { useFollow } from '../../hooks/useFollow';
import { toast } from 'sonner';
import VerifiedBadge from '../../components/VerifiedBadge';

const CATEGORIES = ["Latest", "Trending", "News", "Politics", "Youth Voice"];

function FeedPostItem({ post, user, pName, pAvatarUrl }: { post: any, user: any, pName: string, pAvatarUrl?: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [localReactionsCount, setLocalReactionsCount] = useState(post.reactionsCount || 0);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount || 0);
  const [newComment, setNewComment] = useState("");
  const [copied, setCopied] = useState(false);
  
  let timeAgo = "2h ago";
  if (post.createdAt) {
     try {
        const date = typeof post.createdAt.toDate === 'function' ? post.createdAt.toDate() : new Date(post.createdAt);
        timeAgo = formatDistanceToNow(date, { addSuffix: true }).replace("about ", "");
     } catch (e) {}
  }

  const images = post.imageUrls?.length > 0 ? post.imageUrls : (post.image || post.imageUrl || post.heroUrl || post.coverImage ? [post.image || post.imageUrl || post.heroUrl || post.coverImage] : []);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!user || !post.id) return;
    const unsub = onSnapshot(doc(db, `posts/${post.id}/reactions`, user.uid), (docSnap) => {
      setHasLiked(docSnap.exists());
    });
    return () => unsub();
  }, [user, post.id]);

  useEffect(() => {
    // Keep local counts broadly in sync if the prop changes, though normally they change independently
    if (post.reactionsCount !== undefined) setLocalReactionsCount(post.reactionsCount);
    if (post.commentsCount !== undefined) setLocalCommentsCount(post.commentsCount);
  }, [post.reactionsCount, post.commentsCount]);

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
      toast.error("Please login to bookmark posts");
      return;
    }
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please log in to like posts");
      return loginWithGoogle();
    }
    const reactionRef = doc(db, `posts/${post.id}/reactions`, user.uid);
    const postRef = doc(db, `posts/${post.id}`);
    
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

  const handleComment = async () => {
    if (!user) {
       toast.error("Please login to comment");
       return loginWithGoogle();
    }
    if (!newComment.trim()) return;
    
    const commentText = newComment.trim();
    setNewComment("");
    setLocalCommentsCount((prev: number) => prev + 1);
    
    try {
      await addDoc(collection(db, `posts/${post.id}/comments`), {
        text: commentText,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || '',
        status: 'approved',
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, `posts/${post.id}`), { commentsCount: increment(1) });
      toast.success("Comment posted!");
    } catch (e) {
      console.error("Error adding comment", e);
      toast.error("Failed to post comment");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out "${post.title}" on CJP Media`,
          url: shareUrl,
        });
        await updateDoc(doc(db, `posts/${post.id}`), { sharesCount: increment(1) });
        toast.success("Shared successfully!");
      } catch (err) {
         console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      await updateDoc(doc(db, `posts/${post.id}`), { sharesCount: increment(1) });
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="w-full bg-[#121212]/80 rounded-[28px] border border-white/5 overflow-hidden flex flex-col mb-2 hover:border-white/10 transition-colors">
      
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="w-[42px] h-[42px] shrink-0 relative overflow-hidden rounded-full border border-[#ccff00]/50 hover:border-[#ccff00]/80 transition-colors flex items-center justify-center bg-gradient-to-br from-[#ccff00]/20 to-transparent shadow-[0_0_12px_rgba(204,255,0,0.2)] ring-1 ring-[#ccff00]/20 ring-offset-1 ring-offset-[#0c0c0c]">
             {pAvatarUrl ? (
               <Image src={pAvatarUrl} alt={pName} fill className="object-cover" />
             ) : (
               <Flame className="w-[20px] h-[20px] text-[#ccff00]" strokeWidth={2.5} />
             )}
          </Link>
          <div className="flex flex-col">
             <Link href="/profile" className="flex items-center hover:text-[#ccff00] transition">
                <span className="font-bold text-[16px] leading-none text-white tracking-tight">{pName}</span>
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
        <button className="text-white/40 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors -mr-1.5">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      {/* Image Carousel */}
      <div className="relative w-full aspect-square bg-[#080808] group block">
         <div 
           className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
           onScroll={handleScroll}
         >
            {images.map((img: string, i: number) => (
               <Link href={`/post/${post.id}`} key={i} className="w-full h-full shrink-0 snap-center relative block">
                 <Image 
                   src={img || 'https://picsum.photos/seed/placeholder/800/800'} 
                   alt={post.title || "Post"} 
                   fill 
                   unoptimized
                   priority={i === 0}
                   className="object-contain"
                 />
               </Link>
            ))}
            {/* If no images at all, show a placeholder linked */}
            {images.length === 0 && (
               <Link href={`/post/${post.id}`} className="w-full h-full shrink-0 snap-center relative block">
                 <Image 
                   src={'https://picsum.photos/seed/placeholder/800/800'} 
                   alt={post.title || "Post"} 
                   fill 
                   unoptimized
                   className="object-contain"
                 />
               </Link>
            )}
         </div>

         {/* Badges/Indicators Overlay */}
         <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
           {post.category === 'Trending' && (
             <div className="bg-black/70 text-white text-[13px] font-bold px-3 py-1 rounded-md backdrop-blur-md">
                Trending
             </div>
           )}
         </div>
         <div className="absolute top-3 right-3 flex gap-2 pointer-events-none">
           {hasMultiple ? (
             <div className="bg-black/70 text-white text-[12px] font-bold px-2 py-1 flex items-center gap-1 rounded-md backdrop-blur-md">
                <ImageIcon className="w-3.5 h-3.5" />
                {currentImageIndex + 1}/{images.length}
             </div>
           ) : (
             <div className="bg-black/70 text-white text-[12px] font-bold px-2 py-1 rounded-md backdrop-blur-md">
                1/1
             </div>
           )}
         </div>
         
         {/* Dots (visible if multiple) */}
         {hasMultiple && (
           <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
             {images.map((_: string, i: number) => (
                <div 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                />
             ))}
           </div>
         )}
      </div>
      
      {/* Interaction Row */}
      <div className="px-4 py-3 flex items-center justify-between text-white/60 text-sm">
        <div className="flex items-center gap-5 sm:gap-6">
           <button className="flex items-center gap-1.5 hover:text-white transition">
             <Eye className="w-[18px] h-[18px] text-white/50" />
             <span className="text-[13px]">{post.viewsCount || 0}</span>
           </button>
           <button 
             onClick={handleLike}
             className={`flex items-center gap-1.5 transition ${hasLiked ? 'text-[#ff3366]' : 'hover:text-white'}`}
           >
             <Flame className={`w-[18px] h-[18px] ${hasLiked ? 'fill-[#ff3366] text-[#ff3366]' : 'text-white/50'}`} />
             <span className="text-[13px]">{localReactionsCount}</span>
           </button>
           <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 hover:text-white transition cursor-pointer">
             <MessageCircle className="w-[18px] h-[18px] text-white/50" />
             <span className="text-[13px]">{localCommentsCount}</span>
           </Link>
           <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-white transition">
             {copied ? <Check className="w-[18px] h-[18px] text-[#ccff00]" /> : <Share2 className="w-[18px] h-[18px] text-white/50" />}
             <span className="text-[13px]">{post.sharesCount || 0}</span>
           </button>
        </div>
        <button onClick={handleBookmark} className={`transition ${isBookmarked ? 'text-[#ccff00]' : 'hover:text-white'}`}>
          <Bookmark className={`w-[18px] h-[18px] ${isBookmarked ? 'fill-[#ccff00] text-[#ccff00]' : 'text-white/50'}`} />
        </button>
      </div>
      
      {/* Tags */}
      <div className="px-5 pb-2 pt-1 flex items-center gap-2 flex-wrap">
         <Link href={`/category/${post.category || 'Politics'}`} className="bg-[#ccff00]/10 text-[#ccff00] text-[11px] uppercase font-black tracking-wide px-3 py-1.5 rounded-full line-clamp-1 hover:bg-[#ccff00]/20 transition-colors">
            {post.category || "Politics"}
         </Link>
         {post.tags && post.tags.map((tag: string, index: number) => (
           <span key={index} className="bg-white/5 text-white/70 text-[11px] uppercase font-black tracking-wide px-3 py-1.5 rounded-full line-clamp-1">
             {tag.replace(/^#/, '')}
           </span>
         ))}
      </div>
      
      {/* Captions & Read more */}
      <div className="px-5 pb-3">
        <h3 className="font-bold text-white text-[16px] leading-snug mb-1">
          <Link href={`/post/${post.id}`} className="hover:underline">{post.title}</Link>
        </h3>
        <p className="text-white/60 italic text-[14px] leading-relaxed font-serif">
          "{post.roast || "Cockroach Janta Party Official Logo CJP a Voice of unemployed youth"}"
        </p>
        <Link href={`/post/${post.id}`} className="text-[#ccff00] text-[13px] font-bold flex items-center gap-1.5 mt-2 hover:underline w-max">
          Expand Post
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      
      {/* Comment Input Box */}
      <div className="px-5 pb-5 pt-2 flex items-center gap-3">
        <Avatar className="w-9 h-9 rounded-full ring-2 ring-white/5 shrink-0 object-cover">
           <AvatarImage src={user?.photoURL || undefined} className="object-cover" />
           <AvatarFallback className="bg-[#1a1a1a] text-[#ccff00] font-bold">{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-[#1a1a1a]/50 rounded-full px-4 border border-white/5 flex items-center h-11 transition-colors focus-within:border-[#ccff00]/30 focus-within:bg-[#1a1a1a]">
           <input 
             type="text" 
             value={newComment}
             onChange={e => setNewComment(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handleComment()}
             placeholder="Add a comment..." 
             className="bg-transparent border-none outline-none text-[14px] text-white placeholder-white/30 w-full font-medium" 
           />
           <div className="flex items-center gap-3 text-white/40 pl-2 shrink-0">
             <Smile className="w-5 h-5 hover:text-[#ccff00] cursor-pointer transition-colors" />
             <ImageIcon className="w-5 h-5 hover:text-[#ccff00] cursor-pointer transition-colors" />
           </div>
        </div>
      </div>

    </div>
  );
}

export default function FeedClient({ initialPosts, profile }: { initialPosts: any[], profile?: any }) {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 20);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [filter, setFilter] = useState("Latest");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pName = profile?.name || 'CJP Media';
  const pAvatarUrl = profile?.avatarUrl;
  const { isFollowing, toggleFollow } = useFollow();

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
      
      if (lastVisible) {
        q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(20));
      } else if (posts.length > 0) {
        const baseQ = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(posts.length));
        const snap = await getDocs(baseQ);
        const lastDoc = snap.docs[snap.docs.length - 1];
        if (lastDoc) {
          q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(20));
        }
      }
      
      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().getTime() : data.updatedAt
        };
      });
      
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setPosts(prev => {
          const newMap = new Map(prev.map(p => [p.id, p]));
          newPosts.forEach(p => newMap.set(p.id, p));
          return Array.from(newMap.values()).sort((a, b) => b.createdAt - a.createdAt);
        });
      }
      
      if (snapshot.docs.length < 20) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredPosts = filter === "Latest" ? posts : posts.filter(p => p.category === filter);

  return (
    <div className="flex justify-center min-h-screen bg-[#0a0a0a]">
      <div className="w-full max-w-[1240px] flex justify-center lg:justify-between gap-0 lg:gap-8 px-0 lg:px-4">
        
        {/* Left Sidebar (Desktop Only) */}
        <div className="hidden lg:flex flex-col w-[260px] sticky top-[61px] h-[calc(100vh-61px)] shrink-0 border-r border-white/5 py-4 pr-6">
          <nav className="flex flex-col gap-2">
             <Link href="/" className="flex items-center gap-4 py-3 px-4 rounded-full bg-white/10 text-white font-bold transition w-fit">
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
          {user?.email === 'tgff28970@gmail.com' && (
            <Link href="/admin">
              <button className="w-full bg-[#ccff00] text-black font-bold text-lg rounded-full py-3.5 mt-6 hover:bg-[#bbe600] transition shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                Create Post
              </button>
            </Link>
          )}
        </div>

        {/* Main Feed Container */}
        <div className="w-full max-w-xl mx-auto lg:mx-0 pt-4 pb-20 shrink-0">
        
        {/* Horizontal Filter Pill Tags */}
        <div className="flex items-center gap-2 overflow-x-auto px-2 pb-4 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-bold border border-white/10 transition-colors ${
                filter === cat ? 'bg-[#ccff00] text-black' : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Feed container */}
        <div className="flex flex-col gap-3 px-2">
          {filteredPosts.map((post, i) => (
             <FeedPostItem key={`${post.id}-${i}`} post={post} user={user} pName={pName} pAvatarUrl={pAvatarUrl} />
          ))}
        </div>

        {hasMore && (
           <div className="w-full flex justify-center py-8">
              <button 
                onClick={loadMore} 
                disabled={loadingMore} 
                className="text-[#ccff00] text-sm font-semibold flex items-center gap-2 hover:brightness-110 transition disabled:opacity-50"
              >
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Load more
              </button>
           </div>
        )}

        {filteredPosts.length === 0 && loadingMore && (
           <div className="flex flex-col gap-3 px-2 pt-4">
             {[1,2,3].map(i => (
                <div key={i} className="w-full h-[400px] bg-white/5 rounded-2xl animate-pulse flex flex-col p-4 justify-between border border-white/5">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
                    <div className="flex flex-col gap-2 w-full">
                       <div className="w-1/3 h-3 bg-white/10 rounded-full" />
                       <div className="w-1/4 h-2 bg-white/10 rounded-full" />
                    </div>
                  </div>
                  <div className="w-full h-[250px] bg-white/10 rounded-xl" />
                </div>
             ))}
           </div>
        )}

        {filteredPosts.length === 0 && !loadingMore && (
           <div className="pt-20 text-center flex flex-col items-center justify-center text-white/50 bg-[#121212] border border-white/5 rounded-2xl p-10 m-2">
             <Globe className="w-12 h-12 mb-4 opacity-50" />
             <h3 className="text-white font-bold text-lg mb-2">No posts here</h3>
             <p className="text-sm font-medium">Be the first to share something in this category!</p>
           </div>
        )}

        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button 
             onClick={scrollToTop}
             className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 bg-[#ccff00] text-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
             aria-label="Scroll to top"
          >
             <ArrowUp className="w-6 h-6" strokeWidth={3} />
          </button>
        )}

        {/* Right Sidebar (Desktop Only) */}
        <div className="hidden lg:flex flex-col w-[320px] sticky top-[61px] h-[calc(100vh-61px)] shrink-0 border-l border-white/5 py-4 pl-6 overflow-y-auto scrollbar-hide">
          
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
                    <span className="font-bold text-white leading-tight">Roast Master</span>
                    <span className="text-white/50">@roastmaster</span>
                  </div>
                </div>
                <button onClick={toggleFollow} className={`h-8 px-3 rounded-full font-bold text-sm transition-colors ${isFollowing ? 'bg-white/10 text-white' : 'bg-white text-black'}`}>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="w-10 h-10 rounded-full border border-[#ccff00]/50 flex items-center justify-center shrink-0 overflow-hidden relative shadow-[0_0_8px_rgba(204,255,0,0.2)] bg-gradient-to-br from-[#ccff00]/20 to-transparent">
                    {pAvatarUrl ? (
                      <Image src={pAvatarUrl} alt={pName} fill className="object-cover" />
                    ) : (
                      <Flame className="w-[18px] h-[18px] text-[#ccff00]" strokeWidth={2.5} />
                    )}
                  </Link>
                  <div className="flex flex-col text-sm">
                    <Link href="/profile" className="font-bold text-white leading-tight hover:underline flex items-center gap-1">
                      {pName} <VerifiedBadge className="w-4 h-4" />
                    </Link>
                    <span className="text-white/50">@cjpmedia</span>
                  </div>
                </div>
                <button onClick={toggleFollow} className={`h-8 px-3 rounded-full font-bold text-sm transition-colors ${isFollowing ? 'bg-white/10 text-white' : 'bg-white text-black'}`}>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">Y</span>
                  </div>
                  <div className="flex flex-col text-sm">
                    <span className="font-bold text-white leading-tight">Youth Voice</span>
                    <span className="text-white/50">@youthvoice</span>
                  </div>
                </div>
                <button onClick={toggleFollow} className={`h-8 px-3 rounded-full font-bold text-sm transition-colors ${isFollowing ? 'bg-white/10 text-white' : 'bg-white text-black'}`}>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Trending Topics */}
          <div className="bg-[#121212] rounded-2xl border border-white/5 p-4">
            <h3 className="font-bold text-white text-lg mb-4">Trending USA</h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                 <span className="text-xs text-white/40">Politics • Trending</span>
                 <span className="font-bold text-white text-[15px]">#Election2026</span>
                 <span className="text-xs text-white/40">125K posts</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-xs text-white/40">News • Trending</span>
                 <span className="font-bold text-white text-[15px]">Student Loans</span>
                 <span className="text-xs text-white/40">98.5K posts</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-xs text-white/40">Economy • Trending</span>
                 <span className="font-bold text-white text-[15px]">Job Market</span>
                 <span className="text-xs text-white/40">75K posts</span>
              </div>
            </div>
            <button className="text-[#ccff00] text-sm mt-4 hover:underline text-left">Show more</button>
          </div>
          
          <div className="mt-4 text-[11px] text-white/40 flex flex-wrap gap-x-3 gap-y-1">
             <span>Terms of Service</span>
             <span>Privacy Policy</span>
             <span>Cookie Policy</span>
             <span>Accessibility</span>
             <span>Ads info</span>
             <span>© 2026 CJP Media</span>
          </div>

        </div>

      </div>
    </div>
  );
}
