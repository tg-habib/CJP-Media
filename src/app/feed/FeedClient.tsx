"use client";

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, onSnapshot, updateDoc, increment, setDoc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { MoreVertical, MessageCircle, Share2, Bookmark, Flame, Eye, ChevronDown, Smile, Image as ImageIcon, Globe, Loader2, Link2, Copy, Check, ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, loginWithGoogle } from '../../firebase';
import { formatDistanceToNow } from 'date-fns';
import { useFollow } from '../../hooks/useFollow';
import { toast } from 'sonner';

const CATEGORIES = ["Latest", "Trending", "News", "Politics", "Youth Voice"];

function FeedPostItem({ post, VerifiedBadge, user, pName, pAvatarUrl }: { post: any, VerifiedBadge: any, user: any, pName: string, pAvatarUrl?: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [localReactionsCount, setLocalReactionsCount] = useState(post.reactionsCount || 0);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount || 0);
  const [newComment, setNewComment] = useState("");
  const [copied, setCopied] = useState(false);
  
  let timeAgo = "2h ago";
  if (post.createdAt) {
     try {
        const date = typeof post.createdAt.toDate === 'function' ? post.createdAt.toDate() : post.createdAt;
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
    <div className="w-full bg-[#121212] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="p-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="w-[36px] h-[36px] shrink-0 relative overflow-hidden rounded-full border border-[#ccff00]/20 hover:scale-105 transition-transform flex items-center justify-center bg-[#4d6600]">
             {pAvatarUrl ? (
               <Image src={pAvatarUrl} alt={pName} fill className="object-cover" />
             ) : (
               <Flame className="w-[18px] h-[18px] text-[#ccff00]" strokeWidth={2.5} />
             )}
          </Link>
          <div className="flex flex-col">
             <Link href="/profile" className="flex items-center hover:text-[#ccff00] transition">
                <span className="font-bold text-[15px] leading-none">{pName}</span>
                <VerifiedBadge />
             </Link>
             <div className="text-[12px] text-white/50 flex items-center gap-1 mt-1">
                <span>{timeAgo}</span>
                <span className="text-[10px]">•</span>
                <Globe className="w-3 h-3" />
                <span>Public</span>
             </div>
          </div>
        </div>
        <button className="text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10 transition -mr-1">
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
        <button className="hover:text-white transition">
          <Bookmark className="w-[18px] h-[18px] text-white/50" />
        </button>
      </div>
      
      {/* Tags */}
      <div className="px-4 pb-2 pt-1 flex items-center gap-2 flex-wrap">
         <Link href={`/category/${post.category || 'Politics'}`} className="bg-[#cc6633] text-black text-[11px] font-bold px-2.5 py-1 rounded-md line-clamp-1 hover:brightness-110">
            {post.category || "Politics"}
         </Link>
         <span className="bg-[#33cc33] text-black text-[11px] font-bold px-2.5 py-1 rounded-md line-clamp-1">Youth Voice</span>
         <span className="bg-[#3366cc] text-white text-[11px] font-bold px-2.5 py-1 rounded-md line-clamp-1">Awareness</span>
         <span className="bg-white/10 text-white/80 text-[11px] font-bold px-2.5 py-1 rounded-md">+2</span>
      </div>
      
      {/* Captions & Read more */}
      <div className="px-4 pb-3">
        <h3 className="font-bold text-white text-[15px] leading-snug mb-1">
          <Link href={`/post/${post.id}`} className="hover:underline">{post.title}</Link>
        </h3>
        <p className="text-white/60 italic text-[14px] leading-snug font-serif">
          "{post.roast || "Cockroach Janta Party Official Logo CJP a Voice of unemployed youth"}"
        </p>
        <Link href={`/post/${post.id}`} className="text-[#ccff00] text-[13px] font-medium flex items-center gap-1 mt-1 hover:underline w-max">
          Read more
          <ChevronDown className="w-3.5 h-3.5" />
        </Link>
      </div>
      
      {/* Comment Input Box */}
      <div className="px-4 pb-4 pt-1 flex items-center gap-3">
        <Avatar className="w-8 h-8 rounded-full ring-1 ring-white/10 shrink-0 object-cover">
           <AvatarImage src={user?.photoURL || undefined} className="object-cover" />
           <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-white/[0.03] rounded-full px-4 border border-white/[0.08] flex items-center h-10 transition-colors focus-within:border-white/20 focus-within:bg-white/[0.05]">
           <input 
             type="text" 
             value={newComment}
             onChange={e => setNewComment(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handleComment()}
             placeholder="Write a comment..." 
             className="bg-transparent border-none outline-none text-[14px] text-white placeholder-white/40 w-full" 
           />
           <div className="flex items-center gap-3 text-white/40 pl-2 shrink-0">
             <Smile className="w-[18px] h-[18px] hover:text-white cursor-pointer transition-colors" />
             <ImageIcon className="w-[18px] h-[18px] hover:text-white cursor-pointer transition-colors" />
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

  const VerifiedBadge = () => (
    <svg className="w-[15px] h-[15px] text-[#1d9bf0] ml-1" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.748 1.838 3.447-.075.313-.118.636-.118.97 0 2.21 1.71 4 3.918 4 .51 0 1-.097 1.454-.275C9.176 21.6 10.495 22.5 12 22.5c1.505 0 2.824-.9 3.348-2.275.456.178.945.275 1.454.275 2.21 0 3.918-1.79 3.918-4 0-.334-.043-.656-.118-.97 1.098-.7 1.838-1.987 1.838-3.447z" />
      <path fill="#fff" d="M10.458 15.65c-.24 0-.48-.09-.66-.27l-2.45-2.45c-.36-.36-.36-.95 0-1.32.36-.36.95-.36 1.32 0l1.79 1.79 4.14-4.14c.36-.36.95-.36 1.32 0 .36.36.36.95 0 1.32l-4.8 4.8c-.18.18-.42.27-.66.27z" />
    </svg>
  );

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
             <FeedPostItem key={`${post.id}-${i}`} post={post} VerifiedBadge={VerifiedBadge} user={user} pName={pName} pAvatarUrl={pAvatarUrl} />
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
                  <Link href="/profile" className="w-10 h-10 rounded-full bg-[#4d6600] border border-[#ccff00]/20 flex items-center justify-center shrink-0 overflow-hidden relative">
                    {pAvatarUrl ? (
                      <Image src={pAvatarUrl} alt={pName} fill className="object-cover" />
                    ) : (
                      <Flame className="w-[18px] h-[18px] text-[#ccff00]" strokeWidth={2.5} />
                    )}
                  </Link>
                  <div className="flex flex-col text-sm">
                    <Link href="/profile" className="font-bold text-white leading-tight hover:underline flex items-center gap-1">
                      {pName} <VerifiedBadge />
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
