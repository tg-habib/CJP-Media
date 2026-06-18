import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, query, orderBy, limit,
  deleteDoc, doc, updateDoc, collectionGroup, getDocs, getDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  MessageSquare, Trash2, CheckCircle, XCircle, Search,
  RefreshCw, Filter, X, ChevronDown, Eye, ExternalLink,
  Flag, AlertTriangle, ThumbsUp, ArrowUpDown, User
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

type CommentRecord = {
  id: string;
  postId: string;
  postTitle?: string;
  text: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  status?: 'approved' | 'pending' | 'removed';
  createdAt?: any;
  likes?: number;
};

function timeAgo(ts: any): string {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CommentsTab({ posts, setIsMobileMenuOpen }: { posts: any[]; setIsMobileMenuOpen: (v: boolean) => void }) {
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'removed'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!posts.length) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubs: (() => void)[] = [];
    const commentMap = new Map<string, CommentRecord>();
    let resolved = 0;

    const postTitles: Record<string, string> = {};
    posts.forEach(p => { postTitles[p.id] = p.title || p.id; });

    posts.forEach(post => {
      const q = query(
        collection(db, 'posts', post.id, 'comments'),
        orderBy('createdAt', 'desc'),
        limit(200)
      );
      const unsub = onSnapshot(q, snap => {
        snap.docChanges().forEach(change => {
          if (change.type === 'removed') {
            commentMap.delete(`${post.id}_${change.doc.id}`);
          } else {
            commentMap.set(`${post.id}_${change.doc.id}`, {
              id: change.doc.id,
              postId: post.id,
              postTitle: postTitles[post.id],
              ...change.doc.data(),
            } as CommentRecord);
          }
        });
        setComments(Array.from(commentMap.values()));
        if (resolved < posts.length) {
          resolved++;
          if (resolved === posts.length) setLoading(false);
        }
      });
      unsubs.push(unsub);
    });

    return () => unsubs.forEach(u => u());
  }, [posts]);

  const filtered = comments
    .filter(c => {
      if (filter === 'approved') return c.status === 'approved' || !c.status;
      if (filter === 'pending') return c.status === 'pending';
      if (filter === 'removed') return c.status === 'removed';
      return true;
    })
    .filter(c => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        c.text?.toLowerCase().includes(q) ||
        c.userName?.toLowerCase().includes(q) ||
        c.postTitle?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aT = a.createdAt?.toDate?.()?.getTime() ?? 0;
      const bT = b.createdAt?.toDate?.()?.getTime() ?? 0;
      return sort === 'newest' ? bT - aT : aT - bT;
    });

  const stats = {
    total: comments.length,
    approved: comments.filter(c => c.status === 'approved' || !c.status).length,
    pending: comments.filter(c => c.status === 'pending').length,
    removed: comments.filter(c => c.status === 'removed').length,
  };

  const handleDelete = async (comment: CommentRecord) => {
    if (!confirm('Delete this comment permanently?')) return;
    setDeletingId(comment.id);
    try {
      await deleteDoc(doc(db, 'posts', comment.postId, 'comments', comment.id));
      toast.success('Comment deleted');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleApprove = async (comment: CommentRecord) => {
    try {
      await updateDoc(doc(db, 'posts', comment.postId, 'comments', comment.id), { status: 'approved' });
      toast.success('Comment approved');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRemove = async (comment: CommentRecord) => {
    try {
      await updateDoc(doc(db, 'posts', comment.postId, 'comments', comment.id), { status: 'removed' });
      toast.success('Comment hidden from public');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white w-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold">Comment Moderation</h1>
        </div>
        <p className="text-white/30 text-[13px]">Review and moderate all comments across posts</p>
      </div>

      {/* Stats */}
      <div className="px-5 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-white', bg: 'bg-[#121212] border-white/5', f: 'all' as const },
          { label: 'Approved', value: stats.approved, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', f: 'approved' as const },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', f: 'pending' as const },
          { label: 'Removed', value: stats.removed, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', f: 'removed' as const },
        ].map(({ label, value, color, bg, f }) => (
          <button key={label} onClick={() => setFilter(f)}
            className={`rounded-2xl p-4 border text-left transition-all ${filter === f ? bg : 'bg-[#121212] border-white/5 hover:bg-[#181818]'}`}>
            <MessageSquare className={`w-4 h-4 mb-3 ${filter === f ? color : 'text-white/30'}`} />
            <p className={`text-2xl font-bold tabular-nums ${filter === f ? color : 'text-white'}`}>{value}</p>
            <p className="text-[11px] text-white/40 font-medium mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="px-5 flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search comment text, user, post…"
            className="w-full bg-[#121212] border border-white/[0.07] rounded-xl pl-10 pr-10 h-11 text-white text-[13px] placeholder-white/25 outline-none focus:border-[#ccff00]/30 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setShowSortMenu(v => !v)}
            className="h-11 px-4 bg-[#121212] border border-white/[0.07] rounded-xl flex items-center gap-2 text-white/50 hover:text-white text-[12px] font-semibold transition-colors whitespace-nowrap">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sort === 'newest' ? 'Newest' : 'Oldest'}
            <ChevronDown className="w-3 h-3" />
          </button>
          <AnimatePresence>
            {showSortMenu && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 top-[calc(100%+8px)] w-36 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-xl z-30 overflow-hidden">
                {(['newest', 'oldest'] as const).map(val => (
                  <button key={val} onClick={() => { setSort(val); setShowSortMenu(false); }}
                    className={`w-full px-4 py-3 text-left text-[12px] font-semibold capitalize transition-colors ${sort === val ? 'text-[#ccff00] bg-[#ccff00]/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                    {val === 'newest' ? 'Newest First' : 'Oldest First'}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-5 flex gap-2 mb-5 overflow-x-auto pb-1">
        {([['all', 'All'], ['approved', 'Approved'], ['pending', 'Pending'], ['removed', 'Removed']] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${filter === val ? 'bg-[#ccff00] text-black border-[#ccff00]' : 'bg-transparent border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Comments List */}
      <div className="px-5 pb-10">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-[#ccff00] animate-spin" />
          </div>
        ) : !posts.length ? (
          <div className="py-20 text-center">
            <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 font-medium">No posts exist yet</p>
            <p className="text-white/15 text-[12px] mt-1">Create posts to start receiving comments</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 font-medium">{search ? 'No comments match your search' : 'No comments in this filter'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(comment => (
              <motion.div
                key={`${comment.postId}_${comment.id}`}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-4 transition-all ${
                  comment.status === 'removed'
                    ? 'bg-red-500/[0.04] border-red-500/[0.10]'
                    : comment.status === 'pending'
                    ? 'bg-yellow-500/[0.04] border-yellow-500/[0.10]'
                    : 'bg-[#121212] border-white/5'
                }`}
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {comment.userAvatar ? (
                      <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-white/30" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{comment.userName || 'Anonymous'}</p>
                      <p className="text-[10px] text-white/30">{timeAgo(comment.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {comment.status === 'removed' ? (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded-full">Removed</span>
                    ) : comment.status === 'pending' ? (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded-full">Pending</span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">Approved</span>
                    )}
                  </div>
                </div>

                {/* Comment Text */}
                <p className={`text-[13px] leading-relaxed mb-3 ${comment.status === 'removed' ? 'text-white/30 line-through' : 'text-white/75'}`}>
                  {comment.text}
                </p>

                {/* Post reference */}
                <div className="flex items-center gap-2 mb-4 py-2 px-3 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                  <Eye className="w-3 h-3 text-white/25 shrink-0" />
                  <span className="text-[11px] text-white/35 truncate">On: </span>
                  <a
                    href={`/post/${comment.postId}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-[11px] text-[#ccff00]/60 hover:text-[#ccff00] transition-colors truncate flex items-center gap-1"
                  >
                    {comment.postTitle || comment.postId}
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {comment.status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(comment)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-[11px] font-bold rounded-xl transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                  )}
                  {comment.status !== 'removed' && (
                    <button
                      onClick={() => handleRemove(comment)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 text-[11px] font-bold rounded-xl transition-colors"
                    >
                      <XCircle className="w-3 h-3" /> Hide
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment)}
                    disabled={deletingId === comment.id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 text-red-400 text-[11px] font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {deletingId === comment.id
                      ? <RefreshCw className="w-3 h-3 animate-spin" />
                      : <Trash2 className="w-3 h-3" />
                    }
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
