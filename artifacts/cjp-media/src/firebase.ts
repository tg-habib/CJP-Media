import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  AuthError,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, serverTimestamp, collection, query, orderBy, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const toggleBookmark = async (
  uid: string,
  post: { id: string; title: string; imageUrl?: string; category?: string }
) => {
  const ref = doc(db, 'users', uid, 'bookmarks', post.id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, {
    postId: post.id,
    title: post.title,
    imageUrl: post.imageUrl || '',
    category: post.category || '',
    savedAt: serverTimestamp(),
  });
  return true;
};

export const getBookmarkStatus = async (uid: string, postId: string) => {
  const ref = doc(db, 'users', uid, 'bookmarks', postId);
  const snap = await getDoc(ref);
  return snap.exists();
};

export const ensureAdmin = async (uid: string, email: string) => {
  if (email === "tgff28970@gmail.com") {
    await setDoc(doc(db, "admins", uid), { email }, { merge: true });
  }
};

export const saveUserProfile = async (uid: string, data: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}) => {
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

export const getUserProfile = async (uid: string) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
};

export const getUserBookmarks = async (uid: string) => {
  const snap = await getDocs(query(collection(db, 'users', uid, 'bookmarks'), orderBy('savedAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getUserLikes = async (uid: string) => {
  const snap = await getDocs(query(collection(db, 'users', uid, 'likes'), orderBy('likedAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const loginWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      if (res.user.email) await ensureAdmin(res.user.uid, res.user.email);
      const userRef = doc(db, 'users', res.user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          displayName: res.user.displayName || '',
          email: res.user.email || '',
          avatarUrl: res.user.photoURL || '',
          bio: '',
          createdAt: serverTimestamp(),
        });
      }
      return { success: true };
    }
    return { success: false, error: 'No user returned.' };
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      return { success: false, error: null };
    }
    return { success: false, error: friendlyError(error) };
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    if (res.user?.email) await ensureAdmin(res.user.uid, res.user.email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: friendlyError(error) };
  }
};

export const registerWithEmail = async (name: string, email: string, password: string) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName: name });
    if (res.user?.email) await ensureAdmin(res.user.uid, res.user.email);
    await setDoc(doc(db, 'users', res.user.uid), {
      displayName: name,
      email,
      avatarUrl: '',
      bio: '',
      createdAt: serverTimestamp(),
    });
    return { success: true, isNewUser: true };
  } catch (error: any) {
    return { success: false, error: friendlyError(error) };
  }
};

export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: friendlyError(error) };
  }
};

export const logout = async () => {
  await signOut(auth);
};

function friendlyError(error: AuthError | any): string {
  switch (error?.code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return error?.message || 'Something went wrong. Please try again.';
  }
}
