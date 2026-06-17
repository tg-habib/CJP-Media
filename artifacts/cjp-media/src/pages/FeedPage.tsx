import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { collection, query, orderBy, onSnapshot, limit, doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db, auth, loginWithGoogle } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { Flame, Globe, MessageCircle, Bookmark, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import VerifiedBadge from "../components/VerifiedBadge";
import { SkeletonFeedPost } from "../components/SkeletonPost";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { toast } from "sonner";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleFeedLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to like posts");
      loginWithGoogle();
      return;
    }
    const wasLiked = likedPosts.has(postId);
    setLikedPosts(prev => {
      const next = new Set(prev);
      wasLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    try {
      const reactionRef = doc(db, `posts/${postId}/reactions`, user.uid);
      const postRef = doc(db, `posts/${postId}`);
      if (wasLiked) {
        await deleteDoc(reactionRef);
        await updateDoc(postRef, { reactionsCount: increment(-1) });
      } else {
        await setDoc(reactionRef, { userId: user.uid, createdAt: serverTimestamp() });
        await updateDoc(postRef, { reactionsCount: increment(1) });
      }
    } catch {
      setLikedPosts(prev => {
        const next = new Set(prev);
        wasLiked ? next.add(postId) : next.delete(postId);
        return next;
      });
    }
  };

  useEffect(() => {
    import("firebase/firestore").then(({ doc, getDoc }) => {
      getDoc(doc(db, "settings", "profile")).then((snap) => {
        if (snap.exists()) setProfile(snap.data());
      }).catch(console.error);
    });

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(30));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  return (
    <>
      <Helmet>
        <title>Feed — CJP Media</title>
        <meta name="description" content="Stay up to date with the latest political satire, roasts, and news from CJP Media." />
        <meta property="og:title" content="Feed — CJP Media" />
        <meta property="og:description" content="Stay up to date with the latest political satire, roasts, and news from CJP Media." />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="flex justify-center">
          <div className="w-full max-w-[1240px] flex justify-center lg:justify-between gap-0 lg:gap-8 px-0 lg:px-4">

            {/* Left Sidebar (Desktop Only) */}
            <div className="hidden lg:flex flex-col w-[260px] sticky top-0 h-screen shrink-0 border-r border-white/5 py-4 pr-6">
              <nav className="flex flex-col gap-2">
                <Link href="/" className="flex items-center gap-4 py-3 px-4 rounded-full hover:bg-white/5 text-white/70 transition w-fit">
                  <Globe className="w-6 h-6" /><span className="text-xl">Home</span>
                </Link>
                <Link href="/feed" className="flex items-center gap-4 py-3 px-4 rounded-full bg-white/10 text-white font-bold transition w-fit">
                  <Flame className="w-6 h-6 text-[#ccff00]" /><span className="text-xl">Feed</span>
                </Link>
                <Link href="/category/Trending" className="flex items-center gap-4 py-3 px-4 rounded-full hover:bg-white/5 text-white/70 transition w-fit">
                  <TrendingUp className="w-6 h-6" /><span className="text-xl">Trending</span>
                </Link>
                <Link href="/messages" className="flex items-center gap-4 py-3 px-4 rounded-full hover:bg-white/5 text-white/70 transition w-fit">
                  <MessageCircle className="w-6 h-6" /><span className="text-xl">Messages</span>
                </Link>
                <Link href="/dashboard" className="flex items-center gap-4 py-3 px-4 rounded-full hover:bg-white/5 text-white/70 transition w-fit">
                  <Bookmark className="w-6 h-6" /><span className="text-xl">Saved</span>
                </Link>
              </nav>
            </div>

            {/* Main Feed */}
            <div className="w-full max-w-xl mx-auto lg:mx-0 shrink-0 border-x border-transparent lg:border-white/5 min-h-screen">
              <div
                className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-50 border-b border-white/5"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
              >
                <div className="flex items-center justify-between px-4 h-14">
                  <h1 className="text-white font-bold text-lg">For You</h1>
                </div>
              </div>

              <ErrorBoundary>
                {loading ? (
                  <div className="divide-y divide-white/[0.04]">
                    {Array.from({ length: 5 }).map((_, i) => <SkeletonFeedPost key={i} />)}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-20 text-white/50">No posts yet. Check back soon!</div>
                ) : (
                  <div className="divide-y divide-white/[0.04] pb-24">
                    {posts.map((post) => {
                      let timeAgo = "2h ago";
                      try {
                        const date = typeof post.createdAt?.toDate === "function" ? post.createdAt.toDate() : new Date(post.createdAt);
                        timeAgo = formatDistanceToNow(date, { addSuffix: true }).replace("about ", "");
                      } catch (e) {}

                      const img = post.imageUrls?.[0] || post.imageUrl || post.heroUrl || post.coverImage || post.image;

                      return (
                        <Link key={post.id} href={`/post/${post.id}`} className="block group">
                          <div className="px-4 py-5 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-[#4d6600] flex items-center justify-center shrink-0 border border-[#ccff00]/30 overflow-hidden">
                                {profile?.avatarUrl ? (
                                  <img src={profile.avatarUrl} alt="Author" loading="lazy" className="w-full h-full object-cover" />
                                ) : (
                                  <Flame className="w-5 h-5 text-[#ccff00]" strokeWidth={2.5} />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-white text-[14px]">{profile?.name || "CJP Media"}</span>
                                  <VerifiedBadge className="w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-1.5 text-[12px] text-white/40">
                                  <span>{timeAgo}</span>
                                  <span>·</span>
                                  <Globe className="w-3 h-3" />
                                </div>
                              </div>
                            </div>

                            <h2 className="text-white font-bold text-[16px] leading-snug mb-3 group-hover:text-[#ccff00] transition-colors line-clamp-3">
                              {post.title}
                            </h2>

                            {img && (
                              <div className="w-full rounded-2xl overflow-hidden mb-3 aspect-video bg-black/50">
                                <img
                                  src={img}
                                  alt={post.title}
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-[13px] font-medium mt-1">
                              <button
                                onClick={(e) => handleFeedLike(post.id, e)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95 ${likedPosts.has(post.id) ? 'text-[#ff3366] bg-[#ff3366]/10' : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`}
                              >
                                <Flame className={`w-4 h-4 transition-all ${likedPosts.has(post.id) ? 'fill-[#ff3366] text-[#ff3366]' : ''}`} strokeWidth={2} />
                                <span>{post.reactionsCount || 0}</span>
                              </button>
                              <span className="flex items-center gap-1.5 text-white/30 px-1">
                                <MessageCircle className="w-4 h-4" strokeWidth={2} />
                                <span>{post.commentsCount || 0}</span>
                              </span>
                              {post.category && (
                                <span className="ml-auto bg-[#ccff00]/10 text-[#ccff00] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                  {post.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </ErrorBoundary>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:flex flex-col w-[320px] sticky top-0 h-screen shrink-0 border-l border-white/5 py-4 pl-6 overflow-y-auto scrollbar-hide">
              <div className="bg-[#121212] rounded-2xl border border-white/5 p-4 mb-6">
                <h3 className="font-bold text-white text-lg mb-4">What's happening</h3>
                <div className="flex flex-col gap-3 text-sm text-white/50">
                  <p className="text-white font-semibold">CJP Media — Political Satire & Roasts</p>
                  <p>We speak for the ignored, the unseen, and the unemployed youth.</p>
                </div>
              </div>
              <div className="mt-4 text-[11px] text-white/40 flex flex-wrap gap-x-3 gap-y-1">
                <span>Terms of Service</span>
                <span>Privacy Policy</span>
                <span>© 2026 CJP Media</span>
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </>
  );
}
