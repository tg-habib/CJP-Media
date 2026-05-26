import { getAdminDb } from '../../lib/firebaseAdmin';
import FeedClient from './FeedClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Feed | CJP Media',
  description: 'The latest roasts, news, and updates from CJP.',
};

export default async function FeedPage() {
  let initialPosts: any[] = [];
  let profileSettings: any = null;
  try {
    const db = getAdminDb();
    
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

    const postsSnapshot = await db.collection('posts')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
      
    initialPosts = postsSnapshot.docs.map(doc => {
      const data = doc.data();
      const postData = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : 
          (data.createdAt?._seconds ? data.createdAt._seconds * 1000 : data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().getTime() : 
          (data.updatedAt?._seconds ? data.updatedAt._seconds * 1000 : data.updatedAt),
      };
      return JSON.parse(JSON.stringify(postData));
    });
  } catch (err) {
    console.error("Error fetching initial data for feed on server:", err);
  }

  return <FeedClient initialPosts={initialPosts} profile={profileSettings} />;
}
