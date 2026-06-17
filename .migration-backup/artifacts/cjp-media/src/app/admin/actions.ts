import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function getProfileSettings() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'profile'));
    if (snap.exists()) {
      const data = snap.data();
      return { ...data, updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt };
    }
    return null;
  } catch (e) { console.error('Error fetching profile settings:', e); return null; }
}

export async function saveProfileSettings(data: any) {
  try {
    await setDoc(doc(db, 'settings', 'profile'), { ...data, updatedAt: new Date() }, { merge: true });
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getImageSettings() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'imageUpload'));
    if (snap.exists()) {
      const data = snap.data();
      return { ...data, updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt };
    }
    return null;
  } catch (e) { console.error('Error fetching image settings:', e); return null; }
}

export async function saveImageSettings(data: any) {
  try {
    await setDoc(doc(db, 'settings', 'imageUpload'), { ...data, updatedAt: new Date() }, { merge: true });
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function uploadImageAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('image') as File;
    if (!file) throw new Error('No image file provided');
    const settings = await getImageSettings() as any;
    const providerOverride = formData.get('provider') as string;
    const provider = providerOverride || settings?.provider || 'imgbb';
    if (provider === 'cloudinary') {
      const cloudName = settings?.cloudinaryCloudName || (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = settings?.cloudinaryUploadPreset || 'ml_default';
      if (!cloudName) throw new Error('Cloudinary cloud name not configured');
      const cf = new FormData();
      cf.append('file', file);
      cf.append('upload_preset', uploadPreset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: cf });
      const data = await res.json();
      if (data.secure_url) return { success: true, url: data.secure_url };
      throw new Error(data.error?.message || 'Cloudinary upload failed');
    } else {
      const apiKey = settings?.imgbbApiKey || (import.meta as any).env?.VITE_IMGBB_API_KEY;
      const imgForm = new FormData();
      imgForm.append('image', file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: 'POST', body: imgForm });
      const data = await res.json();
      if (data.success) return { success: true, url: data.data.url };
      throw new Error(data.error?.message || 'ImgBB upload failed');
    }
  } catch (e: any) { return { success: false, error: e.message }; }
}
