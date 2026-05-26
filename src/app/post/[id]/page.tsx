import { getAdminDb } from '../../../lib/firebaseAdmin';
import PostViewClient from './PostViewClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const id = p.id;
  const db = getAdminDb();
  const docSnap = await db.collection('posts').doc(id).get();
  if (!docSnap.exists) {
    return { title: 'Not Found' };
  }
  const post: any = docSnap.data();
  
  const baseUrl = process.env.APP_URL || 'https://Cockroachjantaparty.bond';
  const postUrl = `${baseUrl}/post/${id}`;
  
  const fullTitle = `${post.title} | CJP Media`;
  const title = fullTitle.length > 60 ? `${fullTitle.substring(0, 57)}...` : fullTitle;
  
  const rawDesc = post.roast || "CJP Media Roast";
  const strDesc = String(rawDesc);
  const description = strDesc.length > 160 ? `${strDesc.substring(0, 157)}...` : strDesc;
  
  const finalImgUrl = post.imageUrls?.[0] || post.image || post.imageUrl || post.heroUrl || post.coverImage || '';

  const ogImages = finalImgUrl ? [{ url: finalImgUrl }] : [];
  const twitterImages = finalImgUrl ? [finalImgUrl] : [];

  return {
    title,
    description,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title.substring(0, 60),
      description,
      url: postUrl,
      images: ogImages,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title.substring(0, 60),
      description,
      images: twitterImages,
    }
  }
}

export default async function PostPage({ params }: Props) {
  const p = await params;
  const id = p.id;
  
  const db = getAdminDb();
  
  // Fetch profile settings
  let profileSettings: any = null;
  try {
    const profileSnap = await db.collection('settings').doc('profile').get();
    if (profileSnap.exists) {
      const data = profileSnap.data();
      profileSettings = { ...data };
      if (profileSettings.updatedAt) {
        profileSettings.updatedAt = profileSettings.updatedAt.toDate ? profileSettings.updatedAt.toDate().getTime() : 
          (profileSettings.updatedAt._seconds ? profileSettings.updatedAt._seconds * 1000 : profileSettings.updatedAt);
      }
      profileSettings = JSON.parse(JSON.stringify(profileSettings));
    }
  } catch (err) {
    console.error("Error fetching profile settings:", err);
  }

  const docSnap = await db.collection('posts').doc(id).get();
  
  if (!docSnap.exists) {
    return <div className="pt-32 text-center text-white">Post not found</div>;
  }
  
  const data: any = docSnap.data();
  const initialPostRaw = { 
    id: docSnap.id, 
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : 
      (data.createdAt?._seconds ? data.createdAt._seconds * 1000 : data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().getTime() : 
      (data.updatedAt?._seconds ? data.updatedAt._seconds * 1000 : data.updatedAt)
  };
  const initialPost = JSON.parse(JSON.stringify(initialPostRaw));

  const publishDate = new Date(initialPost.createdAt || Date.now()).toISOString();
  
  // Fetch related posts (Server-Side)
  let relatedPosts: any[] = [];
  try {
    const relatedSnap = await getAdminDb().collection('posts')
      .where('category', '==', initialPost.category)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
      
    relatedPosts = relatedSnap.docs
      .map(doc => {
        const docData = doc.data();
        const rpData = { 
          id: doc.id, 
          ...docData,
          createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().getTime() : 
            (docData.createdAt?._seconds ? docData.createdAt._seconds * 1000 : docData.createdAt),
          updatedAt: docData.updatedAt?.toDate ? docData.updatedAt.toDate().getTime() : 
            (docData.updatedAt?._seconds ? docData.updatedAt._seconds * 1000 : docData.updatedAt)
        };
        return JSON.parse(JSON.stringify(rpData));
      })
      .filter(p => p.id !== id)
      .slice(0, 4);
  } catch (error) {
    console.error("Error fetching related posts:", error);
  }
  
  return (
    <>
      <script
        key="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": (initialPost.title || "Post").substring(0, 110),
            "image": initialPost.imageUrls?.[0] || initialPost.image || initialPost.imageUrl || initialPost.heroUrl || initialPost.coverImage || "https://picsum.photos/seed/placeholder/800/600",
            "datePublished": publishDate,
            "dateModified": publishDate,
            "author": {
              "@type": "Organization",
              "name": "CJP Media"
            },
            "publisher": {
              "@type": "Organization",
              "name": "CJP Media",
              "logo": {
                "@type": "ImageObject",
                "url": "https://Cockroachjantaparty.bond/logo.png"
              }
            }
          })
        }}
      />
      <div className="flex flex-col min-h-screen">
        <PostViewClient id={id} initialPost={initialPost} profile={profileSettings} />
        
        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="container mx-auto px-4 pb-24 max-w-3xl relative z-10">
            <div className="pt-8">
              <h2 className="text-xl font-bold text-white mb-4 drop-shadow-md">More Like This</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map(post => (
                  <a key={post.id} href={`/post/${post.id}`} className="group block outline-none">
                    <div className="relative bg-[#1a1a1a] rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl focus-visible:ring-4 ring-primary/50 flex flex-col h-full border border-white/5">
                      <div className="relative overflow-hidden w-full bg-black/50">
                         <img 
                           src={post.imageUrls?.[0] || post.image || post.imageUrl || post.heroUrl || post.coverImage || 'https://picsum.photos/seed/placeholder/800/600'} 
                           alt={post.title} 
                           loading="lazy"
                           referrerPolicy="no-referrer"
                           className="object-cover w-full h-auto transition-transform duration-700 group-hover:scale-105" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                         {post.imageUrls?.length > 1 && (
                           <div className="absolute top-2 left-2 flex gap-1 items-center bg-black/70 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/10 shadow-lg">
                             <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                             <span className="text-[10px] font-bold text-white">+{post.imageUrls.length - 1}</span>
                           </div>
                         )}
                      </div>
                      <div className="p-4 flex-1 relative z-10">
                        <h3 className="font-bold text-base mb-1 text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                        <p className="text-white/40 text-xs font-semibold capitalize">{post.category}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
