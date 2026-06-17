import { db } from '@/firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function getAdminPost(id: string) {
  try {
    const snap = await getDoc(doc(db, 'posts', id));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id, ...data,
      createdAt: data.createdAt?.toDate?.()?.getTime?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.getTime?.() || data.updatedAt,
    };
  } catch (e) { console.error(e); return null; }
}

export async function updatePost(id: string, data: any) {
  try {
    await updateDoc(doc(db, 'posts', id), { ...data, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deletePost(id: string) {
  try {
    await deleteDoc(doc(db, 'posts', id));
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}
