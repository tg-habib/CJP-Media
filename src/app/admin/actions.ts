'use server'

import { getAdminDb } from '../../lib/firebaseAdmin';
import crypto from 'crypto';

export async function getImgbbApiKey() {
  return process.env.VITE_IMGBB_API_KEY || "your_imgbb_api_key_here";
}

export async function getProfileSettings() {
  try {
    const db = getAdminDb();
    const docSnap = await db.collection('settings').doc('profile').get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (!data) return null;
      return JSON.parse(JSON.stringify({
        ...data,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
      }));
    }
    return null;
  } catch (e) {
    console.error("Error fetching profile settings:", e);
    return null;
  }
}

export async function saveProfileSettings(data: any) {
  try {
    const db = getAdminDb();
    await db.collection('settings').doc('profile').set({
      ...data,
      updatedAt: new Date()
    }, { merge: true });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getImageSettings() {
  try {
    const db = getAdminDb();
    const docSnap = await db.collection('settings').doc('imageUpload').get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (!data) return null;
      return JSON.parse(JSON.stringify({
        ...data,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
      }));
    }
    return null;
  } catch (e) {
    console.error("Error fetching settings:", e);
    return null;
  }
}

export async function saveImageSettings(data: any) {
  try {
    const db = getAdminDb();
    await db.collection('settings').doc('imageUpload').set({
      ...data,
      updatedAt: new Date()
    }, { merge: true });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get('image') as File;
    if (!file) throw new Error("No image file provided");
    
    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Get settings
    const settings = await getImageSettings();
    const providerOverride = formData.get('provider') as string;
    const provider = providerOverride || settings?.provider || 'imgbb';
    
    if (provider === 'cloudinary') {
      const cloudName = settings?.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = settings?.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY;
      const apiSecret = settings?.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET;
      
      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Cloudinary settings are incomplete in Admin Settings or Environment Variables");
      }
      
      const timestamp = Math.floor(Date.now() / 1000);
      const signatureStr = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');
      
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', new Blob([buffer], { type: file.type }), file.name);
      cloudinaryFormData.append('api_key', apiKey);
      cloudinaryFormData.append('timestamp', timestamp.toString());
      cloudinaryFormData.append('signature', signature);
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: cloudinaryFormData
      });
      
      const data = await res.json();
      if (data.secure_url) {
        return { success: true, url: data.secure_url };
      } else {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }
      
    } else {
      // Default to ImgBB
      const apiKey = settings?.imgbbApiKey || process.env.VITE_IMGBB_API_KEY || "c87f9b7cd6c2f15c523c9036f0c61953";
      
      // Try to turn buffer back to blob for fetch
      const imgbbFormData = new FormData();
      imgbbFormData.append("image", new Blob([buffer], { type: file.type }), file.name);
      
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: imgbbFormData
      });
      
      const data = await res.json();
      if (data.success) {
        return { success: true, url: data.data.url };
      } else {
        throw new Error(data.error?.message || "ImgBB upload failed");
      }
    }
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
