import { useEffect, useState, useRef } from 'react';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import {
  doc, onSnapshot, setDoc, deleteDoc, updateDoc, increment,
  serverTimestamp, collection, query, where, orderBy, limit, getDocs
} from 'firebase/firestore';
import { db, auth, loginWithGoogle, toggleBookmark } from '../../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import {
  ArrowLeft, Flame, MessageCircle, Share2, Bookmark,
  Home, TrendingUp, Bell, Eye, Check, User,
} from 'lucide-react';

import VerifiedBadge from '../../../components/VerifiedBadge';
import CommentsSection from '../../../components/CommentsSection';
import BottomNav from '../../../components/BottomNav';
import { useFollow } from '../../../hooks/useFollow';

const NAV = [
  { href: '/',                  Icon: Home,       label: 'Home'     },
  { href: '/feed',              Icon: Flame,      label: 'Feed'     },
  { href: '/category/Trending', Icon: TrendingUp, label: 'Trending' },
  { href: '/notifications',     Icon: Bell,       label: 'Alerts'   },
  { href: '/dashboard',         Icon: Bookmark,   label: 'Saved'    },
];

export default function PostViewClient({
  id,
  initialPost,
  profile,
}: {
  id: string;
  initialPost: any;
  profile?: any;
}) {
  const [post, setPost] = useState<any>(initialPost);
  const [user] = useAuthState(auth);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [hasLiked, setHasLiked] = useState(false);
  const [localReactionsCount, setLocalReactionsCount] = useState(post?.reactionsCount || 0);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);

  const pName = profile?.name || 'CJP Media';
  const pAvatarUrl = profile?.avatarUrl;

  const { isFollowing, toggleFollow } = useFollow();

  /* ── data fetching ── */
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;
    updateDoc(doc(db, 'posts', id), { viewsCount: increment(1) }).catch(() => {});

    const unsub = onSnapshot(doc(db, 'posts', id), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setPost({ id: snap.id, ...data });
        if (data.reactionsCount !== undefined) setLocalReactionsCount(data.reactionsCount);
      } else {
        setNotFound(true);
      }
    }, () => {});
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    const unsub = onSnapshot(doc(db, `posts/${id}/reactions`, user.uid), snap => setHasLiked(snap.exists()));
    return () => unsub();
  }, [user, id]);

  useEffect(() => {
    if (!user || !id) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid, 'bookmarks', id), snap => setIsBookmarked(snap.exists()));
    return () => unsub();
  }, [user, id]);

  useEffect(() => {
    if (!post?.category || !id) return;
    (async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('category', '==', post.category),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snap = await getDocs(q);
        setRelatedPosts(
          snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== id).slice(0, 4)
        );
      } catch (_) {}
    })();
  }, [post?.category, id]);

  /* ── handlers ── */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const idx = Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth);
    if (idx !== currentImageIndex) setCurrentImageIndex(idx);
  };

  const handleLike = async () => {
    if (!user) { toast.error('Sign in to like posts'); loginWithGoogle(); return; }
    const reactionRef = doc(db, `posts/${id}/reactions`, user.uid);
    const postRef    = doc(db, `posts/${id}`);
    try {
      if (hasLiked) {
        setHasLiked(false);
        setLocalReactionsCount((n: number) => Math.max(0, n - 1));
        await deleteDoc(reactionRef);
        await updateDoc(postRef, { reactionsCount: increment(-1) });
      } else {
        setHasLiked(true);
        setLocalReactionsCount((n: number) => n + 1);
        await setDoc(reactionRef, { userId: user.uid, createdAt: serverTimestamp() });
        await updateDoc(postRef, { reactionsCount: increment(1) });
      }
    } catch (e) { console.error(e); }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: `"${post.title}" on CJP Media`, url });
        await updateDoc(doc(db, `posts/${id}`), { sharesCount: increment(1) });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      await updateDoc(doc(db, `posts/${id}`), { sharesCount: increment(1) });
      toast.success('Link copied!');
    }
  };

  const handleBookmark = async () => {
    if (!user) { toast.error('Sign in to save posts'); loginWithGoogle(); return; }
    try {
      const saved = await toggleBookmark(user.uid, {
        id, title: post.title || '',
        imageUrl: post.imageUrls?.[0] || post.imageUrl || '',
        category: post.category || '',
      });
      toast.success(saved ? 'Saved ✓' : 'Removed from bookmarks');
    } catch { toast.error('Could not save'); }
  };

  /* ── loading / not-found states ── */
  if (notFound) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4 text-center px-6">
        <Flame className="w-10 h-10 text-white/10" />
        <p className="text-white font-bold text-lg">Post not found</p>
        <Link href="/feed" className="text-[#ccff00] text-sm font-bold hover:underline">← Back to feed</Link>
        <BottomNav />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin" />
      </div>
    );
  }

  const images = post.imageUrls?.length > 0
    ? post.imageUrls
    : [post.image || post.imageUrl || post.heroUrl || post.coverImage].filter(Boolean);
  const hasMultiple = images.length > 1;

  let timeAgo = '';
  try {
    const date = typeof post.createdAt?.toDate === 'function'
      ? post.createdAt.toDate()
      : new Date(post.createdAt);
    timeAgo = formatDistanceToNow(date, { addSuffix: true }).replace('about ', '');
  } catch (_) {}

  const ogImage  = images[0] || '/opengraph.jpg';
  const postUrl  = `${window.location.origin}/post/${id}`;

  return (
    <>
      <Helmet>
        <title>{post.title ? `${post.title} — CJP Media` : 'CJP Media'}</title>
        <meta name="description"        content={post.roast?.slice(0, 160) || 'Read on CJP Media.'} />
        <meta property="og:title"       content={post.title || 'CJP Media'} />
        <meta property="og:description" content={post.roast?.slice(0, 160) || ''} />
        <meta property="og:image"       content={ogImage} />
        <meta property="og:url"         content={postUrl} />
        <meta property="og:type"        content="article" />
        <meta name="twitter:card"       content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-[#050505]">
        <div className="flex justify-center max-w-[1280px] mx-auto">

          {/* ── Left Sidebar (desktop only) ── */}
          <div className="hidden lg:flex flex-col w-[260px] sticky top-0 h-screen shrink-0 pt-3 pr-6 border-r border-white/[0.05]">
            <Link href="/" className="flex items-center gap-2 px-3 py-2.5 rounded-full hover:bg-white/5 transition-colors w-fit mb-2">
              <Flame className="w-[22px] h-[22px] text-[#ccff00] shrink-0" strokeWidth={2.5} />
              <span className="text-white font-black text-[15px] tracking-tight">
                CJP <span className="text-[#ccff00]">Media</span>
              </span>
            </Link>

            <nav className="flex flex-col gap-0.5 mt-2">
              {NAV.map(({ href, Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3.5 py-2.5 px-3 rounded-full text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors w-fit group"
                >
                  <Icon className="w-[22px] h-[22px] shrink-0 group-hover:text-white/80" strokeWidth={2} />
                  <span className="text-[16px]">{label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-auto mb-4">
              {user ? (
                <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-[#ccff00]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-[13px] truncate leading-none mb-0.5">{user.displayName || 'Account'}</p>
                    <p className="text-white/35 text-[11px] truncate">{user.email}</p>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 bg-[#ccff00] text-black font-bold rounded-full hover:bg-white transition-all text-[13px] shadow-[0_0_20px_rgba(204,255,0,0.15)]"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* ── Main Column ── */}
          <main className="w-full max-w-[600px] border-x border-white/[0.05] min-h-screen">

            {/* Sticky top bar */}
            <div className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.05] flex items-center gap-3 px-4 h-[53px]">
              <button
                onClick={() => window.history.back()}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors text-white shrink-0 -ml-1"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <span className="text-white font-bold text-[15px] truncate flex-1 leading-tight">{post.title || 'Post'}</span>
            </div>

            <div className="pb-32 lg:pb-8">

              {/* ── Author row (name + time only, no Follow — that's in the card below) ── */}
              <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                <Link href="/profile" className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#111] border border-white/10 overflow-hidden flex items-center justify-center hover:border-[#ccff00]/40 transition-colors">
                    {pAvatarUrl
                      ? <img src={pAvatarUrl} alt={pName} className="w-full h-full object-cover" />
                      : <Flame className="w-5 h-5 text-[#ccff00]" strokeWidth={2.5} />
                    }
                  </div>
                </Link>
                <div>
                  <Link href="/profile" className="flex items-center gap-1 hover:underline w-fit">
                    <span className="font-bold text-white text-[14px] leading-none">{pName}</span>
                    <VerifiedBadge className="w-4 h-4" />
                  </Link>
                  <p className="text-white/35 text-[12px] mt-0.5">{timeAgo}</p>
                </div>
                {post.category && (
                  <Link
                    href={`/category/${post.category}`}
                    className="ml-auto shrink-0 text-[#ccff00] text-[11px] font-bold uppercase tracking-[0.1em] bg-[#ccff00]/10 hover:bg-[#ccff00]/20 px-3 py-1 rounded-full transition-colors"
                  >
                    {post.category}
                  </Link>
                )}
              </div>

              {/* Title + roast */}
              <div className="px-4 pb-4 border-b border-white/[0.05]">
                <h1 className="text-[22px] sm:text-[26px] font-extrabold text-white leading-[1.2] tracking-tight mb-2">
                  {post.title}
                </h1>
                {post.roast && (
                  <p className="text-[15px] text-white/45 italic font-serif leading-relaxed">
                    "{post.roast}"
                  </p>
                )}
              </div>

              {/* Image carousel */}
              {images.length > 0 && (
                <div className="relative bg-[#0a0a0a]">
                  <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide items-start"
                    onScroll={handleScroll}
                  >
                    {images.map((img: string, i: number) => (
                      <div key={i} className="w-full shrink-0 snap-center">
                        <img
                          src={img}
                          alt={post.title}
                          className="w-full h-auto block"
                          loading={i === 0 ? 'eager' : 'lazy'}
                        />
                      </div>
                    ))}
                  </div>
                  {hasMultiple && (
                    <>
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full pointer-events-none">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
                        {images.map((_: any, i: number) => (
                          <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${
                              i === currentImageIndex ? 'bg-[#ccff00] w-5' : 'bg-white/30 w-1.5'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Action bar with counts ── */}
              <div className="px-4 py-2.5 flex items-center border-b border-white/[0.05]">

                {/* Left: interactive actions */}
                <div className="flex items-center gap-0.5 -ml-2 flex-1">

                  {/* Like */}
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors text-[13px] font-semibold ${
                      hasLiked
                        ? 'text-[#ff4500] bg-[#ff4500]/8'
                        : 'text-white/40 hover:text-[#ff4500] hover:bg-[#ff4500]/8'
                    }`}
                  >
                    <Flame className={`w-[18px] h-[18px] transition-all ${hasLiked ? 'fill-[#ff4500]' : ''}`} strokeWidth={2} />
                    <span>{localReactionsCount}</span>
                  </button>

                  {/* Comment */}
                  <button
                    onClick={() => document.getElementById('comment-input')?.focus()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white/40 hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/8 transition-colors text-[13px] font-semibold"
                  >
                    <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                    <span>{post.commentsCount || 0}</span>
                  </button>

                  {/* Views (passive) */}
                  <div className="flex items-center gap-1.5 px-3 py-2 text-white/20 text-[13px]">
                    <Eye className="w-[16px] h-[16px]" strokeWidth={1.5} />
                    <span>{(post.viewsCount || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Right: share + bookmark */}
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-white/40 hover:text-[#00ba7c] hover:bg-[#00ba7c]/8 transition-colors"
                    title="Share"
                  >
                    {copied
                      ? <Check className="w-[18px] h-[18px] text-[#ccff00]" strokeWidth={2} />
                      : <Share2 className="w-[18px] h-[18px]" strokeWidth={2} />
                    }
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors ${
                      isBookmarked ? 'text-[#ccff00] bg-[#ccff00]/8' : 'text-white/40 hover:text-[#ccff00] hover:bg-[#ccff00]/8'
                    }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Save'}
                  >
                    <Bookmark className={`w-[18px] h-[18px] ${isBookmarked ? 'fill-[#ccff00]' : ''}`} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Tags (secondary category + all tags) */}
              {post.tags?.length > 0 && (
                <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-white/[0.05]">
                  {post.tags.map((tag: string, i: number) => (
                    <span key={i} className="bg-white/[0.04] text-white/45 text-[11px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border border-white/[0.05]">
                      {tag.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              )}

              {/* ── Author card (CTA to follow) ── */}
              <div className="mx-4 my-5 p-4 rounded-2xl border border-white/[0.07] bg-[#0d0d0d]">
                <div className="flex items-center gap-3 mb-3">
                  <Link href="/profile" className="w-10 h-10 rounded-full bg-[#111] border border-white/10 overflow-hidden flex items-center justify-center shrink-0 hover:border-[#ccff00]/40 transition-colors">
                    {pAvatarUrl
                      ? <img src={pAvatarUrl} alt={pName} className="w-full h-full object-cover" />
                      : <Flame className="w-5 h-5 text-[#ccff00]" strokeWidth={2.5} />
                    }
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href="/profile" className="flex items-center gap-1 hover:underline w-fit">
                      <span className="font-bold text-white text-[14px] leading-none">{pName}</span>
                      <VerifiedBadge className="w-4 h-4" />
                    </Link>
                    <p className="text-white/35 text-[12px] mt-0.5">Political satire · Cockroach Janta Party</p>
                  </div>
                </div>
                <p className="text-white/45 text-[13px] leading-relaxed mb-4">
                  Voice of the ignored, the unseen, and the unemployed youth of India.
                </p>
                <button
                  onClick={toggleFollow}
                  className={`w-full py-2.5 rounded-full font-bold text-[13px] transition-all ${
                    isFollowing
                      ? 'bg-white/[0.06] text-white border border-white/10 hover:bg-white/10'
                      : 'bg-[#ccff00] text-black hover:bg-white shadow-[0_0_20px_rgba(204,255,0,0.15)]'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow CJP Media'}
                </button>
              </div>

              {/* Related posts (horizontal scroll) */}
              {relatedPosts.length > 0 && (
                <div className="border-t border-white/[0.05] px-4 pt-4 pb-4">
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.12em] mb-3">More like this</p>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
                    {relatedPosts.map(rp => {
                      const rpImg = rp.imageUrls?.[0] || rp.image || rp.imageUrl;
                      return (
                        <Link key={rp.id} href={`/post/${rp.id}`} className="shrink-0 w-[140px] group">
                          <div className="w-[140px] h-[80px] rounded-xl overflow-hidden bg-[#111] border border-white/[0.06] mb-2">
                            {rpImg
                              ? <img src={rpImg} alt={rp.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                              : <div className="w-full h-full flex items-center justify-center"><Flame className="w-5 h-5 text-white/10" /></div>
                            }
                          </div>
                          <p className="text-white/60 text-[11px] font-semibold line-clamp-2 leading-snug group-hover:text-[#ccff00] transition-colors">
                            {rp.title}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Comments ── */}
              <div className="border-t border-white/[0.05] px-4 pt-4">
                <CommentsSection postId={id} initialCommentsCount={post.commentsCount} />
              </div>

            </div>
          </main>

          {/* ── Right Sidebar (desktop only) ── */}
          <div className="hidden lg:flex flex-col w-[340px] sticky top-0 h-screen overflow-y-auto scrollbar-hide shrink-0 pl-8 py-4 border-l border-white/[0.05]">

            {/* Author card */}
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <Link href="/profile" className="w-10 h-10 rounded-full bg-[#111] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                  {pAvatarUrl
                    ? <img src={pAvatarUrl} alt={pName} className="w-full h-full object-cover" />
                    : <Flame className="w-5 h-5 text-[#ccff00]" strokeWidth={2.5} />
                  }
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href="/profile" className="flex items-center gap-1 hover:underline w-fit">
                    <span className="text-white font-bold text-[13px] leading-none">{pName}</span>
                    <VerifiedBadge className="w-3.5 h-3.5" />
                  </Link>
                  <p className="text-white/35 text-[11px] mt-0.5">Political Satire</p>
                </div>
                <button
                  onClick={toggleFollow}
                  className={`shrink-0 h-8 px-4 rounded-full text-[12px] font-bold transition-all border ${
                    isFollowing
                      ? 'border-white/15 text-white/80 bg-white/[0.06]'
                      : 'border-[#ccff00]/30 text-[#ccff00] hover:bg-[#ccff00]/8'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
              <p className="text-white/35 text-[12px] leading-relaxed">
                The official media wing of the Cockroach Janta Party. Unfiltered satire, roasts, and the news they don't want you to see.
              </p>
            </div>

            {/* Sign-in CTA */}
            {!user && (
              <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-4 mb-4">
                <h3 className="text-white font-bold text-[14px] mb-1">Join the conversation</h3>
                <p className="text-white/40 text-[12px] leading-relaxed mb-3">
                  Sign in to like this post, leave a comment, or save it for later.
                </p>
                <button
                  onClick={loginWithGoogle}
                  className="w-full py-2.5 bg-[#ccff00] text-black font-bold rounded-full text-[13px] hover:bg-white transition-colors shadow-[0_0_20px_rgba(204,255,0,0.12)]"
                >
                  Continue with Google
                </button>
              </div>
            )}

            {/* Related posts on sidebar */}
            {relatedPosts.length > 0 && (
              <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl overflow-hidden mb-4">
                <div className="px-4 py-3 border-b border-white/[0.05]">
                  <h3 className="font-extrabold text-white text-[14px]">More in {post.category}</h3>
                </div>
                {relatedPosts.map(rp => {
                  const rpImg = rp.imageUrls?.[0] || rp.image || rp.imageUrl;
                  return (
                    <Link key={rp.id} href={`/post/${rp.id}`} className="flex gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group border-t border-white/[0.04] first:border-0">
                      <div className="w-[52px] h-[52px] rounded-xl overflow-hidden bg-[#111] shrink-0">
                        {rpImg
                          ? <img src={rpImg} alt={rp.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Flame className="w-4 h-4 text-white/10" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-[12px] line-clamp-2 leading-snug group-hover:text-[#ccff00] transition-colors">{rp.title}</p>
                        {rp.category && (
                          <p className="text-[#ccff00]/50 text-[10px] font-bold uppercase tracking-wide mt-1">{rp.category}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div className="px-1 text-[11px] text-white/20 flex flex-wrap gap-x-2 gap-y-1 mt-auto">
              <Link href="/terms"   className="hover:text-white/40 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white/40 transition-colors">Privacy</Link>
              <span>© 2026 CJP Media</span>
            </div>
          </div>

        </div>

        <BottomNav />
      </div>
    </>
  );
}
