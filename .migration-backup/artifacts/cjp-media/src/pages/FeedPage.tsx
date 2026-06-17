import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import {
  collection, query, orderBy, onSnapshot, limit,
  doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp
} from "firebase/firestore";
import { db, auth, loginWithGoogle, toggleBookmark } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import BottomNav from "../components/BottomNav";
import {
  Flame, Globe, MessageCircle, Bookmark, TrendingUp,
  Share2, Home, User, Bell, LogIn
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import VerifiedBadge from "../components/VerifiedBadge";
import { SkeletonFeedPost } from "../components/SkeletonPost";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { toast } from "sonner";

type FeedTab = "foryou" | "trending";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<FeedTab>("foryou");

  useEffect(() => {
    import("firebase/firestore").then(({ doc: d, getDoc }) => {
      getDoc(d(db, "settings", "profile")).then((snap) => {
        if (snap.exists()) setProfile(snap.data());
      }).catch(() => {});
    });

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(30));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const handleFeedLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to like posts"); loginWithGoogle(); return; }
    const wasLiked = likedPosts.has(postId);
    setLikedPosts(prev => { const n = new Set(prev); wasLiked ? n.delete(postId) : n.add(postId); return n; });
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
      setLikedPosts(prev => { const n = new Set(prev); wasLiked ? n.add(postId) : n.delete(postId); return n; });
    }
  };

  const handleFeedShare = async (postId: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${postId}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied!"); }
    } catch { toast.error("Could not share"); }
  };

  const handleFeedBookmark = async (post: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to save posts"); loginWithGoogle(); return; }
    try {
      const saved = await toggleBookmark(user.uid, {
        id: post.id,
        title: post.title || "",
        imageUrl: post.imageUrls?.[0] || post.imageUrl || "",
        category: post.category || "",
      });
      toast.success(saved ? "Saved to bookmarks ✓" : "Removed from bookmarks");
    } catch { toast.error("Could not save"); }
  };

  const displayedPosts = activeTab === "trending"
    ? [...posts].sort((a, b) =>
        ((b.reactionsCount || 0) + (b.viewsCount || 0)) -
        ((a.reactionsCount || 0) + (a.viewsCount || 0))
      )
    : posts;

  const trendingPosts = [...posts]
    .sort((a, b) =>
      ((b.reactionsCount || 0) + (b.viewsCount || 0)) -
      ((a.reactionsCount || 0) + (a.viewsCount || 0))
    )
    .slice(0, 5);

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/feed", icon: Flame, label: "Feed", active: true },
    { href: "/category/Trending", icon: TrendingUp, label: "Trending" },
    { href: "/notifications", icon: Bell, label: "Alerts" },
    { href: "/dashboard", icon: Bookmark, label: "Saved" },
  ];

  return (
    <>
      <Helmet>
        <title>Feed — CJP Media</title>
        <meta name="description" content="Stay up to date with the latest political satire, roasts, and news from CJP Media." />
      </Helmet>

      <div className="min-h-screen bg-[#000000]">
        <div className="flex justify-center max-w-[1280px] mx-auto">

          {/* ── Left Sidebar (desktop) ── */}
          <div className="hidden lg:flex flex-col w-[275px] sticky top-0 h-screen shrink-0 pt-2 pr-4">
            <Link href="/" className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-white/5 transition-colors mb-2">
              <Flame className="w-7 h-7 text-[#ccff00]" strokeWidth={2.5} />
            </Link>

            <nav className="flex flex-col gap-0.5 mt-2">
              {navItems.map(({ href, icon: Icon, label, active }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-4 py-3 px-3 rounded-full transition-colors w-fit ${
                    active
                      ? "text-white font-bold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-[26px] h-[26px] ${active ? "text-[#ccff00]" : ""}`} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[20px]">{label}</span>
                </Link>
              ))}
            </nav>

            {user && (
              <div className="mt-auto mb-3 flex items-center gap-3 p-3 rounded-full hover:bg-white/5 transition-colors cursor-pointer">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#ccff00]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate leading-none mb-0.5">
                    {user.displayName || "Account"}
                  </p>
                  <p className="text-white/40 text-xs truncate">{user.email}</p>
                </div>
              </div>
            )}

            {!user && (
              <button
                onClick={loginWithGoogle}
                className="mt-auto mb-4 flex items-center justify-center gap-2 py-3 px-5 bg-[#ccff00] text-black font-bold rounded-full hover:bg-[#bbe600] transition-colors text-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>

          {/* ── Main Feed ── */}
          <main className="w-full max-w-[600px] border-x border-white/[0.06] min-h-screen">
            {/* Sticky header with tabs */}
            <div
              className="sticky top-0 bg-black/80 backdrop-blur-xl z-50 border-b border-white/[0.06]"
              style={{ paddingTop: "env(safe-area-inset-top)" }}
            >
              <div className="flex items-center h-[53px] px-4">
                <h1 className="sr-only">CJP Media Feed</h1>
              </div>
              <div className="flex border-b border-white/[0.06]">
                {(["foryou", "trending"] as FeedTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-[15px] font-bold relative transition-colors ${
                      activeTab === tab ? "text-white" : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {tab === "foryou" ? "For You" : "Trending"}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#ccff00] rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <ErrorBoundary>
              {loading ? (
                <div className="divide-y divide-white/[0.06]">
                  {Array.from({ length: 5 }).map((_, i) => <SkeletonFeedPost key={i} />)}
                </div>
              ) : displayedPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                  <Flame className="w-10 h-10 text-white/10" />
                  <p className="text-white font-bold">Nothing here yet</p>
                  <p className="text-white/40 text-sm">Check back soon for fresh content.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06] pb-24 lg:pb-8">
                  {displayedPosts.map((post) => {
                    let timeAgo = "";
                    try {
                      const date = typeof post.createdAt?.toDate === "function"
                        ? post.createdAt.toDate()
                        : new Date(post.createdAt);
                      timeAgo = formatDistanceToNow(date, { addSuffix: true }).replace("about ", "");
                    } catch (_) {}

                    const img = post.imageUrls?.[0] || post.imageUrl || post.heroUrl || post.coverImage || post.image;
                    const liked = likedPosts.has(post.id);

                    return (
                      <Link key={post.id} href={`/post/${post.id}`} className="block group">
                        <article className="px-4 py-4 hover:bg-white/[0.02] transition-colors">
                          {/* Author row */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1a2900] flex items-center justify-center shrink-0 border border-[#ccff00]/20 overflow-hidden mt-0.5">
                              {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Flame className="w-5 h-5 text-[#ccff00]" strokeWidth={2.5} />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Name + time */}
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <span className="font-bold text-white text-[15px] leading-none">
                                  {profile?.name || "CJP Media"}
                                </span>
                                <VerifiedBadge className="w-4 h-4 shrink-0" />
                                <span className="text-white/40 text-[14px] leading-none">·</span>
                                <span className="text-white/40 text-[14px] leading-none">{timeAgo}</span>
                                {post.category && (
                                  <>
                                    <span className="text-white/20 text-[14px] leading-none">·</span>
                                    <span className="text-[#ccff00]/60 text-[12px] font-bold uppercase tracking-wide leading-none">
                                      {post.category}
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Title */}
                              <h2 className="text-white text-[15px] leading-[1.4] mb-3 group-hover:text-white/90 transition-colors font-normal">
                                {post.title}
                              </h2>

                              {/* Image */}
                              {img && (
                                <div className="w-full rounded-2xl overflow-hidden mb-3 aspect-video bg-black border border-white/[0.06]">
                                  <img
                                    src={img}
                                    alt={post.title}
                                    loading="lazy"
                                    decoding="async"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                                  />
                                </div>
                              )}

                              {/* Action bar — 4 icons */}
                              <div className="flex items-center justify-between -ml-2 mt-1">
                                {/* Like */}
                                <button
                                  onClick={(e) => handleFeedLike(post.id, e)}
                                  className={`group/a flex items-center gap-1.5 transition-colors ${
                                    liked ? "text-[#ff4500]" : "text-white/40 hover:text-[#ff4500]"
                                  }`}
                                >
                                  <div className={`p-2 rounded-full transition-colors ${
                                    liked ? "bg-[#ff4500]/10" : "group-hover/a:bg-[#ff4500]/10"
                                  }`}>
                                    <Flame
                                      className={`w-[18px] h-[18px] transition-all ${liked ? "fill-[#ff4500]" : ""}`}
                                      strokeWidth={2}
                                    />
                                  </div>
                                  <span className="text-[13px] font-medium">{post.reactionsCount || 0}</span>
                                </button>

                                {/* Comment */}
                                <span className="group/a flex items-center gap-1.5 text-white/40 hover:text-[#1d9bf0] transition-colors">
                                  <div className="p-2 rounded-full group-hover/a:bg-[#1d9bf0]/10 transition-colors">
                                    <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
                                  </div>
                                  <span className="text-[13px] font-medium">{post.commentsCount || 0}</span>
                                </span>

                                {/* Share */}
                                <button
                                  onClick={(e) => handleFeedShare(post.id, post.title, e)}
                                  className="group/a flex items-center gap-1.5 text-white/40 hover:text-[#00ba7c] transition-colors"
                                >
                                  <div className="p-2 rounded-full group-hover/a:bg-[#00ba7c]/10 transition-colors">
                                    <Share2 className="w-[18px] h-[18px]" strokeWidth={2} />
                                  </div>
                                </button>

                                {/* Bookmark */}
                                <button
                                  onClick={(e) => handleFeedBookmark(post, e)}
                                  className="group/a flex items-center gap-1.5 text-white/40 hover:text-[#ccff00] transition-colors"
                                >
                                  <div className="p-2 rounded-full group-hover/a:bg-[#ccff00]/10 transition-colors">
                                    <Bookmark className="w-[18px] h-[18px]" strokeWidth={2} />
                                  </div>
                                </button>

                                {/* Globe indicator */}
                                <Globe className="w-[15px] h-[15px] text-white/20 mr-1" strokeWidth={1.5} />
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>
              )}
            </ErrorBoundary>
          </main>

          {/* ── Right Sidebar (desktop) ── */}
          <div className="hidden lg:flex flex-col w-[350px] sticky top-0 h-screen overflow-y-auto scrollbar-hide shrink-0 pl-8 py-3">
            {/* Trending section */}
            {trendingPosts.length > 0 && (
              <div className="bg-[#111111] rounded-2xl overflow-hidden mb-4">
                <h3 className="font-extrabold text-white text-xl px-4 py-4">Trending</h3>
                {trendingPosts.map((p, i) => {
                  const engagement = (p.reactionsCount || 0) + (p.viewsCount || 0);
                  return (
                    <Link
                      key={p.id}
                      href={`/post/${p.id}`}
                      className="flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors group border-t border-white/[0.05]"
                    >
                      <span className="text-white/20 font-black text-lg leading-none mt-0.5 w-5 shrink-0 text-right">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-xs capitalize mb-0.5">
                          {p.category || "CJP Media"}
                        </p>
                        <p className="text-white font-bold text-sm line-clamp-2 group-hover:text-[#ccff00] transition-colors leading-snug">
                          {p.title}
                        </p>
                        {engagement > 0 && (
                          <p className="text-white/25 text-xs mt-1">{engagement.toLocaleString()} interactions</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Sign in CTA for guests */}
            {!user && (
              <div className="bg-[#111111] rounded-2xl p-5 mb-4">
                <h3 className="font-extrabold text-white text-xl mb-1">Don't miss out</h3>
                <p className="text-white/50 text-sm mb-4">Sign in to like, comment, and save posts.</p>
                <button
                  onClick={loginWithGoogle}
                  className="w-full py-2.5 bg-white text-black font-bold rounded-full text-sm hover:bg-white/90 transition-colors"
                >
                  Continue with Google
                </button>
              </div>
            )}

            {/* About */}
            <div className="bg-[#111111] rounded-2xl p-4 mb-4">
              <p className="text-white font-bold text-sm mb-1">CJP Media</p>
              <p className="text-white/40 text-xs leading-relaxed">
                The official media wing of the Cockroach Janta Party. Political satire, roasts, and unfiltered news.
              </p>
            </div>

            <div className="px-1 text-[11px] text-white/25 flex flex-wrap gap-x-2 gap-y-1">
              <span className="hover:underline cursor-pointer">Terms</span>
              <span className="hover:underline cursor-pointer">Privacy</span>
              <span>© 2026 CJP Media</span>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </>
  );
}
