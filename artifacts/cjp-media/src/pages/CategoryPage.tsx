import { useParams, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { ArrowLeft, Flame, MessageCircle, TrendingUp, Landmark, Megaphone, Mic2, Zap, Newspaper, Eye } from "lucide-react";
import { SkeletonCard } from "../components/SkeletonPost";
import { ErrorBoundary } from "../components/ErrorBoundary";
import BottomNav from "../components/BottomNav";
import { formatDistanceToNow } from "date-fns";

const CATEGORY_META: Record<string, {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  description: string;
  color: string;
}> = {
  Trending:      { Icon: TrendingUp, description: "The hottest takes everyone's talking about.",   color: "#ff6b35" },
  Politics:      { Icon: Landmark,   description: "Unfiltered political commentary and satire.",   color: "#ccff00" },
  "Youth Voice": { Icon: Megaphone,  description: "Stories, opinions, and voices that matter.",    color: "#33ccff" },
  Satire:        { Icon: Mic2,       description: "Brutal, honest, funny — the real kind of roast.", color: "#a855f7" },
  Roasts:        { Icon: Mic2,       description: "Brutal, honest, funny — the real kind of roast.", color: "#ff3366" },
  Breaking:      { Icon: Zap,        description: "Latest breaking news and updates.",              color: "#f59e0b" },
};

const DEFAULT_META = {
  Icon: Newspaper,
  color: "#ccff00",
};

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug || "");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const meta = CATEGORY_META[slug] || { ...DEFAULT_META, description: `Browse all posts in ${slug}.` };
  const { Icon, color, description } = meta;

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
        <meta name="description" content={description} />
        <meta property="og:title" content={`${slug} — CJP Media`} />
        <meta property="og:description" content={description} />
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
          <div className="py-8 flex items-center gap-4 border-b border-white/[0.05] mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
            >
              <Icon className="w-6 h-6" style={{ color }} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">{slug}</h2>
              <p className="text-white/40 text-sm mt-0.5">{description}</p>
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
              <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
                <div
                  className="w-20 h-20 rounded-[28px] flex items-center justify-center"
                  style={{ backgroundColor: `${color}12`, border: `1px solid ${color}25` }}
                >
                  <Icon className="w-9 h-9" style={{ color }} strokeWidth={1.5} />
                </div>
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
                        <div className="relative bg-[#0a0a0a] overflow-hidden">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className="w-full h-auto block"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-40">
                              <Icon className="w-8 h-8 text-white/10" strokeWidth={1.5} />
                            </div>
                          )}
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
