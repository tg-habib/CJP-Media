"use client";

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, loginWithGoogle } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MoreVertical, ThumbsUp, ChevronDown, Smile, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function CommentsSection({ postId, initialCommentsCount }: { postId: string, initialCommentsCount?: number }) {
  const [user] = useAuthState(auth);
  const isAdmin = user?.email === 'tgff28970@gmail.com';
  
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!postId) return;
    const unsub = onSnapshot(query(collection(db, `posts/${postId}/comments`), orderBy('createdAt', 'desc'), limit(50)), (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [postId]);

  const handlePostComment = async (): Promise<void> => {
    if (!user) { loginWithGoogle(); return; }
    if (!postId || !newComment.trim()) return;
    try {
      await addDoc(collection(db, `posts/${postId}/comments`), {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || '',
        status: 'approved',
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, `posts/${postId}`), { commentsCount: increment(1) });
      setNewComment("");
    } catch (e) {
      console.error(e);
    }
  };

  const displayCount = Math.max(initialCommentsCount || 0, comments.length);

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
         <h2 className="text-[17px] font-semibold text-[#f5f5f5]">Comments ({displayCount})</h2>
         <button className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors">
           Most recent <ChevronDown className="w-3.5 h-3.5" />
         </button>
      </div>

      <div className="flex-1 space-y-6 pb-6">
        <AnimatePresence>
          {comments.map((comment, i) => {
            let timeAgo = "just now";
            if (comment.createdAt) {
               try { 
                  const date = typeof comment.createdAt.toDate === 'function' ? comment.createdAt.toDate() : comment.createdAt;
                  timeAgo = formatDistanceToNow(date, { addSuffix: true }).replace("about ", ""); 
               } catch(e){}
            }
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                key={comment.id} 
                className="flex gap-3 group"
              >
                <Avatar className="w-9 h-9 flex-shrink-0 object-cover mt-0.5">
                  <AvatarImage src={comment.userAvatar} className="object-cover" />
                  <AvatarFallback className="bg-white/10 text-white text-xs">{comment.userName?.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 flex flex-col">
                  {/* Name, time, and content */}
                  <div className="flex justify-between items-start w-full">
                     <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex items-center gap-2">
                           <span className="font-bold text-[14px] text-white/90">{comment.userName}</span>
                           <span className="text-[13px] text-white/40">{timeAgo}</span>
                        </div>
                        <p className="text-[14px] text-white/80 leading-snug">{comment.text}</p>
                     </div>
                     <button className="text-white/40 hover:text-white mt-0.5">
                       <MoreVertical className="w-4 h-4" />
                     </button>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                     <button className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors">
                        <ThumbsUp className="w-[14px] h-[14px]" />
                        <span className="text-[13px] font-medium font-mono">0</span>
                     </button>
                     <div className="w-[1px] h-3 bg-white/20"></div>
                     <button className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">
                        Reply
                     </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input box */}
      <div className="pt-2 pb-4 flex items-center gap-3">
        <Avatar className="w-10 h-10 rounded-full shrink-0 object-cover mt-px ring-2 ring-white/5">
           <AvatarImage src={user?.photoURL || undefined} className="object-cover" />
           <AvatarFallback className="bg-[#1a1a1a] text-[#ccff00] font-bold">{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-[#1a1a1a]/50 rounded-full px-4 border border-white/5 flex items-center h-12 transition-colors focus-within:border-[#ccff00]/30 focus-within:bg-[#1a1a1a]">
           <input 
             id="comment-input"
             type="text" 
             value={newComment}
             onChange={e => setNewComment(e.target.value)}
             onKeyDown={e => e.key === 'Enter' && handlePostComment()}
             placeholder="Add a comment..." 
             className="bg-transparent border-none outline-none text-[14px] text-white placeholder-white/30 w-full font-medium" 
           />
           <div className="flex items-center gap-3 text-white/40 pl-2 shrink-0">
             <Smile className="w-5 h-5 hover:text-[#ccff00] cursor-pointer transition-colors" />
             <ImageIcon className="w-5 h-5 hover:text-[#ccff00] cursor-pointer transition-colors" />
           </div>
        </div>
      </div>
    </div>
  );
}

