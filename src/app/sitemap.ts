import { MetadataRoute } from 'next';
import { getAdminDb } from '../lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'https://Cockroachjantaparty.bond';
  
  // Static pages
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ];

  try {
    const db = getAdminDb();
    const postsSnapshot = await db.collection('posts').get();
    
    const postRoutes = postsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const lastModified = data.createdAt?.toDate 
        ? data.createdAt.toDate()
        : new Date();
        
      return {
        url: `${baseUrl}/post/${doc.id}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    });

    return [...routes, ...postRoutes];
  } catch (err) {
    console.error('Error generating sitemap:', err);
    return routes;
  }
}
