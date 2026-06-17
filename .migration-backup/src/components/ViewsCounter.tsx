"use client";

import { useEffect, useState } from 'react';
import { doc, onSnapshot, increment, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Eye } from 'lucide-react';
import { motion } from 'motion/react';

export default function ViewsCounter({ postId, initialViews }: { postId: string, initialViews?: number }) {
  const [views, setViews] = useState(initialViews || 0);

  useEffect(() => {
    // Increment view count exactly once per load on client
    const incrementView = async () => {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          viewsCount: increment(1)
        });
      } catch (err) {
        console.error("Failed to increment views:", err);
      }
    };
    
    incrementView();

    // Listen to real-time updates
    const unsubscribe = onSnapshot(doc(db, "posts", postId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.viewsCount === 'number') {
          setViews(data.viewsCount);
        }
      }
    });

    return () => unsubscribe();
  }, [postId]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-1.5 text-white/50 text-sm font-medium"
      title={`${views} views`}
    >
      <Eye className="w-4 h-4" />
      <span>{views.toLocaleString()}</span>
    </motion.div>
  );
}
