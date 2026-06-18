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
import VerifiedBadge from "../components/VerifiedBadge";
import { SkeletonFeedPost } from "../components/SkeletonPost";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Flame, Home, TrendingUp, Bell, Bookmark, MessageCircle,
  Share2, Eye, User, LogIn, Globe, Search,
} from "lucide-react";

type FeedTab = "foryou" | "trending";

const NAV = [
  { href: "/",                   Icon: Home,       label: "Home"     },
  { href: "/feed",               Icon: Flame,      label: "Feed",    active: true },
  { href: "/category/Trending",  Icon: TrendingUp, label: "Trending" },
  { href: "/notifications",      Icon: Bell,       label: "Alerts"   },
  { href: "/dashboard",          Icon: Bookmark,   label: "Saved"    },
];

export default function FeedPage() {
  const [posts,     setPosts]     = useState<any[]>([]);
  const [profile,   setProfile]   = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [user]                    = useAuthState(auth);
  const [likedPosts,setLikedPosts]= useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<FeedTab>("foryou");

  useEffect(() => {
    import("firebase/firestore").then(({ doc: d, getDoc }) => {
      getDoc(d(db, "settings", "profile")).then(snap => {
        if (snap.exists()) setProfile(snap.data());
      }).catch(() => {});
    });

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(30));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error("Sign in to like posts"); loginWithGoogle(); return; }
    const wasLiked = likedPosts.has(postId);
    setLikedPosts(prev => { const n = new Set(prev); wasLiked ? n.delete(postId) : n.add(postId); return n; });
    try {
      const ref  = doc(db, `posts/${postId}/reactions`, user.uid);
      const pRef = doc(db, `posts/${postId}`);
      if (wasLiked) { await deleteDoc(ref); await updateDoc(pRef, { reactionsCount: increment(-1) }); }
      else          { await setDoc(ref, { userId: user.uid, createdAt: serverTimestamp() }); await updateDoc(pRef, { reactionsCount: increment(1) }); }
    } catch { setLikedPosts(prev => { const n = new Set(prev); wasLiked ? n.add(postId) : n.delete(postId); return n; }); }
  };

  const handleShare = async (postId: string, title: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const url = `${window.location.origin}/post/${postId}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied!"); }
    } catch { toast.error("Could not share"); }
  };

  const handleBookmark = async (post: any, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error("Sign in to save posts"); loginWithGoogle(); return; }
    try {
      const saved = await toggleBookmark(user.uid, {
        id: post.id, title: post.title || "",
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

  return (
    <>
      <Helmet>
        <title>Feed — CJP Media</title>
        <meta name="description" content="Stay up to date with the latest political satire, roasts, and news from CJP Media." />
      </Helmet>

      <div className="min-h-screen bg-[#050505]">
        <div className="flex justify-center max-w-[1280px] mx-auto">

          {/* ── Left Sidebar (desktop only) ── */}
          <div className="hidden lg:flex flex-col w-[260px] sticky top-0 h-screen shrink-0 pt-3 pr-6 border-r border-white/[0.05]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 px-3 py-2.5 rounded-full hover:bg-white/5 transition-colors w-fit mb-2 group">
              <Flame className="w-[22px] h-[22px] text-[#ccff00] shrink-0" strokeWidth={2.5} />
              <span className="text-white font-black text-[15px] tracking-tight">
                CJP <span className="text-[#ccff00]">Media</span>
              </span>
            </Link>

            {/* Nav */}
            <nav className="flex flex-col gap-0.5 mt-2">
              {NAV.map(({ href, Icon, label, active }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3.5 py-2.5 px-3 rounded-full transition-colors w-fit group ${
                    active ? "text-white font-bold" : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    className={`w-[22px] h-[22px] shrink-0 transition-colors ${active ? "text-[#ccff00]" : "group-hover:text-white/80"}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className="text-[16px]">{label}</span>
                </Link>
              ))}
            </nav>

            {/* Bottom: user card or sign-in */}
            <div className="mt-auto mb-4">
              {user ? (
                <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center shrink-0">
                      <User className="w-4.5 h-4.5 text-[#ccff00]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-[13px] truncate leading-none mb-0.5">
                      {user.displayName || "Account"}
                    </p>
                    <p className="text-white/35 text-[11px] truncate">{user.email}</p>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-5 bg-[#ccff00] text-black font-bold rounded-full hover:bg-white transition-all text-[13px] shadow-[0_0_20px_rgba(204,255,0,0.15)]"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* ── Main Feed ── */}
          <main className="w-full max-w-[600px] border-x border-white/[0.05] min-h-screen">

            {/* Sticky tabs header */}
            <div className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.05]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
              <div className="flex">
                {(["foryou", "trending"] as FeedTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3.5 text-[14px] font-bold relative transition-colors ${
                      activeTab === tab ? "text-white" : "text-white/35 hover:text-white/60"
                    }`}
                  >
                    {tab === "foryou" ? "For You" : "Trending"}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-[3px] bg-[#ccff00] rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts */}
            <ErrorBoundary>
              {loading ? (
                <div className="divide-y divide-white/[0.05]">
                  {Array.from({ length: 5 }).map((_, i) => <SkeletonFeedPost key={i} />)}
                </div>
              ) : displayedPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center gap-3 px-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-2">
                    <Flame className="w-7 h-7 text-white/15" strokeWidth={1.5} />
                  </div>
                  <p className="text-white font-bold text-[15px]">Nothing here yet</p>
                  <p className="text-white/35 text-[13px]">Check back soon for fresh content.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05] pb-24 lg:pb-8">
                  {displayedPosts.map(post => {
                    let timeAgo = "";
                    try {
                      const date = typeof post.createdAt?.toDate === "function"
                        ? post.createdAt.toDate()
                        : new Date(post.createdAt);
                      timeAgo = formatDistanceToNow(date, { addSuffix: true }).replace("about ", "");
                    } catch (_) {}

                    const img   = post.imageUrls?.[0] || post.imageUrl || post.heroUrl || post.coverImage || post.image;
                    const liked = likedPosts.has(post.id);

                    return (
                      <article key={post.id} className="px-4 py-4 hover:bg-white/[0.015] transition-colors">
                        {/* Author row */}
                        <div className="flex items-start gap-3">

                          {/* Avatar */}
                          <Link href="/profile" className="shrink-0 mt-0.5">
                            <div className="w-10 h-10 rounded-full bg-[#111] border border-[#ccff00]/25 overflow-hidden flex items-center justify-center hover:border-[#ccff00]/50 transition-colors">
                              {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Flame className="w-5 h-5 text-[#ccff00]" strokeWidth={2.5} />
                              )}
                            </div>
                          </Link>

                          <div className="flex-1 min-w-0">
                            {/* Name row */}
                            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                              <Link href="/profile" className="hover:underline">
                                <span className="font-bold text-white text-[14px] leading-none">
                                  {profile?.name || "CJP Media"}
                                </span>
                              </Link>
                              <VerifiedBadge className="w-4 h-4 shrink-0" />
                              <span className="text-white/25 text-[13px] leading-none">·</span>
                              <span className="text-white/35 text-[13px] leading-none">{timeAgo}</span>
                              {post.category && (
                                <>
                                  <span className="text-white/15 text-[13px] leading-none">·</span>
                                  <span className="text-[#ccff00] text-[11px] font-bold uppercase tracking-[0.1em] leading-none">
                                    {post.category}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Title */}
                            <Link href={`/post/${post.id}`} className="block group mb-3">
                              <h2 className="text-white text-[15px] leading-[1.45] font-medium group-hover:text-white/80 transition-colors">
                                {post.title}
                              </h2>
                              {post.roast && (
                                <p className="text-white/35 text-[13px] italic leading-relaxed mt-0.5 line-clamp-2 font-serif">
                                  {post.roast}
                                </p>
                              )}
                            </Link>

                            {/* Image */}
                            {img && (
                              <Link href={`/post/${post.id}`} className="block mb-3 group">
                                <div className="w-full rounded-xl overflow-hidden border border-white/[0.06] group-hover:border-white/[0.12] transition-colors bg-[#0d0d0d]" style={{ aspectRatio: "16/9" }}>
                                  <img
                                    src={img}
                                    alt={post.title}
                                    loading="lazy"
                                    decoding="async"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                                  />
                                </div>
                              </Link>
                            )}

                            {/* Action bar */}
                            <div className="flex items-center gap-1 -ml-2">

                              {/* Flame / Like */}
                              <button
                                onClick={e => handleLike(post.id, e)}
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-colors text-[13px] font-medium ${
                                  liked
                                    ? "text-[#ff4500] bg-[#ff4500]/8"
                                    : "text-white/40 hover:text-[#ff4500] hover:bg-[#ff4500]/8"
                                }`}
                              >
                                <Flame className={`w-[17px] h-[17px] transition-all ${liked ? "fill-[#ff4500]" : ""}`} strokeWidth={2} />
                                <span>{post.reactionsCount || 0}</span>
                              </button>

                              {/* Comments */}
                              <Link
                                href={`/post/${post.id}`}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-white/40 hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/8 transition-colors text-[13px] font-medium"
                              >
                                <MessageCircle className="w-[17px] h-[17px]" strokeWidth={2} />
                                <span>{post.commentsCount || 0}</span>
                              </Link>

                              {/* Views */}
                              <div className="flex items-center gap-1.5 px-2 py-1.5 text-white/25 text-[13px] font-medium">
                                <Eye className="w-[17px] h-[17px]" strokeWidth={2} />
                                <span>{post.viewsCount || 0}</span>
                              </div>

                              {/* Share */}
                              <button
                                onClick={e => handleShare(post.id, post.title, e)}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-white/40 hover:text-[#00ba7c] hover:bg-[#00ba7c]/8 transition-colors ml-auto"
                              >
                                <Share2 className="w-[17px] h-[17px]" strokeWidth={2} />
                              </button>

                              {/* Bookmark */}
                              <button
                                onClick={e => handleBookmark(post, e)}
                                className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-white/40 hover:text-[#ccff00] hover:bg-[#ccff00]/8 transition-colors"
                              >
                                <Bookmark className="w-[17px] h-[17px]" strokeWidth={2} />
                              </button>

                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </ErrorBoundary>
          </main>

          {/* ── Right Sidebar (desktop only) ── */}
          <div className="hidden lg:flex flex-col w-[340px] sticky top-0 h-screen overflow-y-auto scrollbar-hide shrink-0 pl-8 py-4 border-l border-white/[0.05]">

            {/* Search hint */}
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-2.5 mb-5 cursor-default">
              <Search className="w-4 h-4 text-white/25 shrink-0" />
              <span className="text-white/25 text-[13px]">Search CJP Media…</span>
            </div>

            {/* Trending */}
            {trendingPosts.length > 0 && (
              <div className="bg-[#0d0d0d] rounded-2xl border border-white/[0.06] overflow-hidden mb-4">
                <div className="px-4 py-3.5 border-b border-white/[0.05]">
                  <h3 className="font-extrabold text-white text-[16px]">Trending on CJP</h3>
                </div>
                {trendingPosts.map((p, i) => {
                  const engagement = (p.reactionsCount || 0) + (p.viewsCount || 0);
                  return (
                    <Link
                      key={p.id}
                      href={`/post/${p.id}`}
                      className="flex gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group border-t border-white/[0.04] first:border-0"
                    >
                      <span className="text-white/20 font-black text-[15px] leading-none mt-0.5 w-4 shrink-0 text-right tabular-nums">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        {p.category && (
                          <p className="text-[#ccff00]/60 text-[11px] font-bold uppercase tracking-[0.1em] mb-0.5">{p.category}</p>
                        )}
                        <p className="text-white font-semibold text-[13px] line-clamp-2 group-hover:text-[#ccff00] transition-colors leading-snug">
                          {p.title}
                        </p>
                        {engagement > 0 && (
                          <p className="text-white/20 text-[11px] mt-0.5 font-medium">{engagement.toLocaleString()} interactions</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Sign-in CTA for guests */}
            {!user && (
              <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5 mb-4">
                <h3 className="font-extrabold text-white text-[15px] mb-1">Don't miss out</h3>
                <p className="text-white/40 text-[13px] mb-4 leading-relaxed">Sign in to like, comment, and save posts.</p>
                <button
                  onClick={loginWithGoogle}
                  className="w-full py-2.5 bg-[#ccff00] text-black font-bold rounded-full text-[13px] hover:bg-white transition-colors shadow-[0_0_20px_rgba(204,255,0,0.12)]"
                >
                  Continue with Google
                </button>
              </div>
            )}

            {/* About */}
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-[#ccff00]" strokeWidth={2.5} />
                <p className="text-white font-bold text-[13px]">CJP Media</p>
              </div>
              <p className="text-white/35 text-[12px] leading-relaxed">
                The official media wing of the Cockroach Janta Party. Political satire, roasts, and unfiltered news.
              </p>
            </div>

            {/* Footer links */}
            <div className="px-1 text-[11px] text-white/20 flex flex-wrap gap-x-2 gap-y-1">
              <Link href="/terms" className="hover:text-white/40 transition-colors">Terms</Link>
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
