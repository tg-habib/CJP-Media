import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, loginWithGoogle } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export function useFollow() {
  const [user] = useAuthState(auth);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsFollowing(false);
      return;
    }
    const unsub = onSnapshot(doc(db, 'followers', user.uid), (docSnap) => {
      setIsFollowing(docSnap.exists());
    });
    return () => unsub();
  }, [user]);

  const toggleFollow = async () => {
    if (!user) {
      return loginWithGoogle();
    }
    const ref = doc(db, 'followers', user.uid);
    try {
      if (isFollowing) {
        await deleteDoc(ref);
        setIsFollowing(false);
      } else {
        await setDoc(ref, {
          followedAt: serverTimestamp(),
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          userPhotoURL: user.photoURL
        });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  return { isFollowing, toggleFollow };
}
