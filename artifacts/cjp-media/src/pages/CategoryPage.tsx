import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, Flame, Eye, MessageCircle, TrendingUp } from "lucide-react";
import { SkeletonCard } from "../components/SkeletonPost";
import { ErrorBoundary } from "../components/ErrorBoundary";
import BottomNav from "../components/BottomNav";
import { formatDistanceToNow } from "date-fns";

const CATEGORY_META: Record<string, { icon: string; description: string; color: string }> = {
  Trending: { icon: "🔥", description: "The hottest takes everyone's talking about.", color: "#ff6b35" },
  Politics: { icon: "🗳️", description: "Unfiltered political commentary and satire.", color: "#ccff00" },
  "Youth Voice": { icon: "📢", description: "Stories, opinions, and voices that matter.", color: "#33ccff" },
  Roasts: { icon: "🎤", description: "Brutal, honest, funny — the real kind of roast.", color: "#ff3366" },
};

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug || "");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const meta = CATEGORY_META[slug] || { icon: "📰", description: `Browse all posts in ${slug}.`, color: "#ccff00" };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const q = query(collection(db, "posts"), where("category", "==", slug), orderBy("createdAt", "desc"), limit(30));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          imageUrl: data.imageUrls?.[0] || data.imageUrl || data.image || data.heroUrl || data.coverImage || "",
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      }));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [slug]);

  return (
    <>
      <Helmet>
        <title>{slug} — CJP Media</title>
        <meta name="description" content={meta.description} />
        <meta property="og:title" content={`${slug} — CJP Media`} />
        <meta property="og:description" content={meta.description} />
      </Helmet>

      <div className="min-h-screen bg-[#050505] pb-28 sm:pb-10">
        <div
          className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.06]"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/15 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-white font-bold text-lg tracking-tight truncate">{slug}</h1>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <div className="py-8 flex items-end gap-4 border-b border-white/[0.05] mb-6">
            <span className="text-4xl">{meta.icon}</span>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">{slug}</h2>
              <p className="text-white/40 text-sm mt-0.5">{meta.description}</p>
              {!loading && (
                <p className="text-white/25 text-xs mt-1 font-medium">
                  {posts.length} {posts.length === 1 ? "post" : "posts"}
                </p>
              )}
            </div>
          </div>

          <ErrorBoundary>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <span className="text-5xl">{meta.icon}</span>
                <div>
                  <p className="text-white font-bold text-lg">No posts yet</p>
                  <p className="text-white/40 text-sm mt-1">Be the first to publish in {slug}.</p>
                </div>
                <Link href="/feed" className="mt-2 px-5 py-2.5 bg-[#ccff00] text-black font-bold rounded-full text-sm hover:bg-[#bbe600] transition-colors">
                  Browse Feed
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {posts.map((post) => {
                  let timeAgo = "";
                  try {
                    timeAgo = formatDistanceToNow(post.createdAt, { addSuffix: true }).replace("about ", "");
                  } catch (_) {}

                  return (
                    <Link key={post.id} href={`/post/${post.id}`} className="group block outline-none">
                      <div className="flex flex-col bg-[#111111] border border-white/[0.06] rounded-[20px] overflow-hidden hover:border-white/15 transition-all duration-300 hover:scale-[1.02]">
                        <div className="relative aspect-square bg-[#0a0a0a] overflow-hidden">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <TrendingUp className="w-8 h-8 text-white/20" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <div className="p-3 flex flex-col flex-1">
                          <h3 className="text-white font-bold text-[13px] leading-snug line-clamp-2 mb-2 group-hover:text-[#ccff00] transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-auto text-[11px] text-white/30 font-medium">
                            <span className="flex items-center gap-0.5">
                              <Flame className="w-3 h-3" /> {post.reactionsCount || 0}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <MessageCircle className="w-3 h-3" /> {post.commentsCount || 0}
                            </span>
                            {timeAgo && <span className="ml-auto truncate">{timeAgo}</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </ErrorBoundary>
        </div>

        <BottomNav />
      </div>
    </>
  );
}
