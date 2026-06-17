import { useParams } from "wouter";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Badge } from "../components/ui/badge";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slugDecoded = decodeURIComponent(params.slug || "");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slugDecoded) return;
    setLoading(true);
    const fetchPosts = async () => {
      try {
        const postsSnap = await getDocs(
          query(collection(db, "posts"), where("category", "==", slugDecoded), orderBy("createdAt", "desc"), limit(20))
        );
        setPosts(postsSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            category: data.category,
            imageUrls: data.imageUrls || [],
            imageUrl: data.imageUrls?.[0] || data.image || data.imageUrl || data.coverImage || "https://picsum.photos/seed/placeholder/800/600",
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          };
        }));
      } catch (error) {
        console.error("Error fetching category posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [slugDecoded]);

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white capitalize mb-4">Category: {slugDecoded}</h1>
          <p className="text-lg text-white/70">Showing {posts.length} posts for this category.</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-white/50">No posts found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="group block outline-none">
                <div className="relative glassmorphism rounded-3xl overflow-hidden transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_-20px_rgba(57,255,20,0.2)] group-focus-visible:ring-4 ring-[#ccff00]/50">
                  <div className="relative overflow-hidden w-full bg-black/50">
                    <img
                      src={post.imageUrl}
                      alt={post.title || "Post image"}
                      referrerPolicy="no-referrer"
                      className="transition-transform duration-700 group-hover:scale-105 w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                      <Badge className="bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-lg capitalize tracking-wider font-semibold px-3 py-1">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6 relative z-10 bg-gradient-to-b from-card/80 to-card backdrop-blur-xl border-t border-white/5">
                    <h3 className="text-xl font-bold mb-3 text-white line-clamp-2 leading-snug group-hover:text-[#ccff00] transition-colors">{post.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
