import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      if (res.user.email) {
        await ensureAdmin(res.user.uid, res.user.email);
      }
      return true;
    }
    return false;
  } catch (error: any) {
    if (error?.code !== 'auth/popup-closed-by-user') {
       console.error("Login failed", error);
       if (error?.code === 'auth/cancelled-popup-request' || error?.message?.includes('Cross-Origin')) {
         alert("Please open this app in a new browser tab to sign in, as the preview environment might block login popups.");
       } else {
         alert("Login failed: " + error.message);
       }
    }
    return false;
  }
};

export const logout = async () => {
  await signOut(auth);
};

export const ensureAdmin = async (uid: string, email: string) => {
  if (email === "tgff28970@gmail.com") {
    await setDoc(doc(db, "admins", uid), { email }, { merge: true });
  }
};
