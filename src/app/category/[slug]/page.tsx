import { getAdminDb } from '../../../lib/firebaseAdmin';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '../../../components/ui/badge';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  // Category slugs might be URL encoded, e.g., "artificial%20intelligence"
  const slugDecoded = decodeURIComponent(p.slug);
  const title = `${slugDecoded} | CJP Media Categories`;
  const description = `Explore all roasts and posts under the ${slugDecoded} category on CJP Media.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const p = await params;
  const slugDecoded = decodeURIComponent(p.slug);
  
  const db = getAdminDb();
  let posts: any[] = [];
  
  try {
    const postsSnap = await db.collection('posts')
      .where('category', '==', slugDecoded)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
      
    posts = postsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        category: data.category,
        imageUrl: data.imageUrls?.[0] || data.image || data.imageUrl || data.coverImage || 'https://picsum.photos/seed/placeholder/800/600',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
      };
    });
  } catch (error) {
    console.error("Error fetching category posts:", error);
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-7xl">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-white capitalize mb-4">
          Category: {slugDecoded}
        </h1>
        <p className="text-lg text-white/70">
          Showing {posts.length} posts for this category.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-white/50">
          No posts found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} className="group block outline-none">
              <div className="relative glassmorphism rounded-3xl overflow-hidden transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_-20px_rgba(57,255,20,0.2)] group-focus-visible:ring-4 ring-primary/50">
                <div className="relative overflow-hidden w-full bg-black/50">
                   <Image 
                     src={post.imageUrl} 
                     alt={post.title || "Post image"} 
                     width={0}
                     height={0}
                     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                     style={{ width: '100%', height: 'auto' }}
                     referrerPolicy="no-referrer"
                     className="transition-transform duration-700 group-hover:scale-105" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                   <div className="absolute top-4 left-4 z-10 flex gap-2">
                     <Badge className="bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-lg capitalize tracking-wider font-semibold px-3 py-1">
                       {post.category}
                     </Badge>
                     {post.imageUrls?.length > 1 && (
                       <Badge className="bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-lg px-2 flex items-center gap-1">
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                         +{post.imageUrls.length - 1}
                       </Badge>
                     )}
                   </div>
                </div>
                <div className="p-6 relative z-10 bg-gradient-to-b from-card/80 to-card backdrop-blur-xl border-t border-white/5">
                  <h3 className="text-xl font-bold mb-3 text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
