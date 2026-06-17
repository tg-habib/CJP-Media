'use server';

import { getAdminDb } from '@/lib/firebaseAdmin';

export async function getAdminPost(id: string) {
  try {
    const db = getAdminDb();
    const docSnap = await db.collection('posts').doc(id).get();
    
    if (!docSnap.exists) return null;
    
    const data = docSnap.data();
    const postData = {
      id: docSnap.id,
      ...data,
      createdAt: data?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || null,
    };
    return JSON.parse(JSON.stringify(postData));
  } catch (error) {
    console.error('Error fetching admin post:', error);
    return null;
  }
}
