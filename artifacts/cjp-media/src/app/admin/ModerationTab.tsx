import { useState, useEffect, useRef } from 'react';
import {
  collection, onSnapshot, query, orderBy, limit,
  doc, updateDoc, deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Menu, Shield, Search, X, ChevronDown, ArrowUpDown,
  CheckCircle, XCircle, Trash2, Eye, MessageSquare,
  FileText, RefreshCw, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

type PostRecord = {
  id: string;
  title?: string;
  category?: string;
  imageUrls?: string[];
  imageUrl?: string;
  tags?: string[];
  reactionsCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  createdAt?: any;
  moderationStatus?: 'published' | 'removed';
};

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
};

function safeDate(ts: any): Date | null {
  if (!ts) return null;
  if (ts?.toDate) return ts.toDate();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

function timeAgo(ts: any): string {
  const d = safeDate(ts);
  if (!d) return '—';
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: 'Published', cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
    approved:  { label: 'Approved',  cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
    pending:   { label: 'Pending',   cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    removed:   { label: 'Removed',   cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  };
  const s = map[status] ?? map['published'];
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  );
}

export default function ModerationTab({
  posts: rawPosts,
  setIsMobileMenuOpen,
}: {
  posts: any[];
  setIsMobileMenuOpen: (v: boolean) => void;
}) {
  const [subTab, setSubTab] = useState<'posts' | 'comments'>('posts');

  // ── Posts state ──────────────────────────────────────────────
  const [postFilter, setPostFilter] = useState<'all' | 'published' | 'removed'>('all');
  const [postSearch, setPostSearch] = useState('');
  const [postSort, setPostSort] = useState<'newest' | 'oldest'>('newest');
  const [showPostSort, setShowPostSort] = useState(false);
  const [postSortRef] = [useRef<HTMLDivElement>(null)];
  const [processingPostId, setProcessingPostId] = useState<string | null>(null);

  // ── Comments state ────────────────────────────────────────────
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentFilter, setCommentFilter] = useState<'all' | 'approved' | 'pending' | 'removed'>('all');
  const [commentSearch, setCommentSearch] = useState('');
  const [commentSort, setCommentSort] = useState<'newest' | 'oldest'>('newest');
  const [showCommentSort, setShowCommentSort] = useState(false);
  const commentSortRef = useRef<HTMLDivElement>(null);
  const [processingCommentId, setProcessingCommentId] = useState<string | null>(null);

  // ── Click-outside for sort dropdowns ─────────────────────────
  useEffect(() => {
    if (!showPostSort) return;
    const h = (e: MouseEvent) => {
      if (postSortRef.current && !postSortRef.current.contains(e.target as Node)) setShowPostSort(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showPostSort]);

  useEffect(() => {
    if (!showCommentSort) return;
    const h = (e: MouseEvent) => {
      if (commentSortRef.current && !commentSortRef.current.contains(e.target as Node)) setShowCommentSort(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showCommentSort]);

  // ── Fetch comments from all posts ────────────────────────────
  useEffect(() => {
    if (!rawPosts.length) { setCommentsLoading(false); return; }
    setCommentsLoading(true);
    const map = new Map<string, CommentRecord>();
    const titles: Record<string, string> = {};
    rawPosts.forEach(p => { titles[p.id] = p.title || p.id; });
    let resolved = 0;
    const unsubs = rawPosts.map(post => {
      const q = query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'desc'), limit(200));
      return onSnapshot(q, snap => {
        snap.docChanges().forEach(ch => {
          const key = `${post.id}_${ch.doc.id}`;
          if (ch.type === 'removed') { map.delete(key); }
          else { map.set(key, { id: ch.doc.id, postId: post.id, postTitle: titles[post.id], ...ch.doc.data() } as CommentRecord); }
        });
        setComments(Array.from(map.values()));
        if (resolved < rawPosts.length) { resolved++; if (resolved === rawPosts.length) setCommentsLoading(false); }
      });
    });
    return () => unsubs.forEach(u => u());
  }, [rawPosts]);

  // ── Posts derived data ────────────────────────────────────────
  const posts: PostRecord[] = rawPosts.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category,
    imageUrls: p.imageUrls,
    imageUrl: p.imageUrl,
    tags: p.tags,
    reactionsCount: p.reactionsCount,
    commentsCount: p.commentsCount,
    viewsCount: p.viewsCount,
    createdAt: p.createdAt,
    moderationStatus: p.moderationStatus ?? 'published',
  }));

  const postStats = {
    total: posts.length,
    published: posts.filter(p => (p.moderationStatus ?? 'published') === 'published').length,
    removed: posts.filter(p => p.moderationStatus === 'removed').length,
  };

  const filteredPosts = posts
    .filter(p => {
      if (postFilter === 'published') return (p.moderationStatus ?? 'published') === 'published';
      if (postFilter === 'removed') return p.moderationStatus === 'removed';
      return true;
    })
    .filter(p => {
      if (!postSearch.trim()) return true;
      const q = postSearch.toLowerCase();
      return p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const at = safeDate(a.createdAt)?.getTime() ?? 0;
      const bt = safeDate(b.createdAt)?.getTime() ?? 0;
      return postSort === 'newest' ? bt - at : at - bt;
    });

  // ── Comments derived data ─────────────────────────────────────
  const commentStats = {
    total: comments.length,
    approved: comments.filter(c => c.status === 'approved' || !c.status).length,
    pending: comments.filter(c => c.status === 'pending').length,
    removed: comments.filter(c => c.status === 'removed').length,
  };

  const filteredComments = comments
    .filter(c => {
      if (commentFilter === 'approved') return c.status === 'approved' || !c.status;
      if (commentFilter === 'pending') return c.status === 'pending';
      if (commentFilter === 'removed') return c.status === 'removed';
      return true;
    })
    .filter(c => {
      if (!commentSearch.trim()) return true;
      const q = commentSearch.toLowerCase();
      return c.text?.toLowerCase().includes(q) || c.userName?.toLowerCase().includes(q) || c.postTitle?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const at = safeDate(a.createdAt)?.getTime() ?? 0;
      const bt = safeDate(b.createdAt)?.getTime() ?? 0;
      return commentSort === 'newest' ? bt - at : at - bt;
    });

  // ── Post actions ──────────────────────────────────────────────
  const removePost = async (id: string) => {
    setProcessingPostId(id);
    try {
      await updateDoc(doc(db, 'posts', id), { moderationStatus: 'removed' });
      toast.success('Post removed from public view');
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessingPostId(null); }
  };

  const restorePost = async (id: string) => {
    setProcessingPostId(id);
    try {
      await updateDoc(doc(db, 'posts', id), { moderationStatus: 'published' });
      toast.success('Post restored');
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessingPostId(null); }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Permanently delete this post? This cannot be undone.')) return;
    setProcessingPostId(id);
    try {
      await deleteDoc(doc(db, 'posts', id));
      toast.success('Post deleted');
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessingPostId(null); }
  };

  // ── Comment actions ───────────────────────────────────────────
  const approveComment = async (c: CommentRecord) => {
    setProcessingCommentId(c.id);
    try {
      await updateDoc(doc(db, 'posts', c.postId, 'comments', c.id), { status: 'approved' });
      toast.success('Comment approved');
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessingCommentId(null); }
  };

  const removeComment = async (c: CommentRecord) => {
    setProcessingCommentId(c.id);
    try {
      await updateDoc(doc(db, 'posts', c.postId, 'comments', c.id), { status: 'removed' });
      toast.success('Comment hidden');
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessingCommentId(null); }
  };

  const deleteComment = async (c: CommentRecord) => {
    if (!confirm('Permanently delete this comment?')) return;
    setProcessingCommentId(c.id);
    try {
      await deleteDoc(doc(db, 'posts', c.postId, 'comments', c.id));
      toast.success('Comment deleted');
    } catch (e: any) { toast.error(e.message); }
    finally { setProcessingCommentId(null); }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white w-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden text-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60 rounded-lg p-1"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <Shield className="w-5 h-5 text-[#ccff00]" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Moderation</h1>
        </div>
        <p className="text-white/30 text-[13px] ml-8 lg:ml-0">Review and manage all content visibility across the platform</p>
      </div>

      {/* Sub-tab switcher */}
      <div className="px-5 flex gap-1 mb-6">
        {([
          { id: 'posts', label: 'Posts', icon: FileText, count: postStats.total },
          { id: 'comments', label: 'Comments', icon: MessageSquare, count: commentStats.total },
        ] as const).map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            aria-current={subTab === id ? 'page' : undefined}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60 ${
              subTab === id
                ? 'bg-[#ccff00] text-black'
                : 'bg-[#121212] border border-white/[0.07] text-white/50 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black tabular-nums ${subTab === id ? 'bg-black/20 text-black' : 'bg-white/10 text-white/40'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── POSTS panel ─────────────────────────────────────── */}
      {subTab === 'posts' && (
        <>
          {/* Stats */}
          <div className="px-5 grid grid-cols-3 gap-3 mb-6">
            {([
              { label: 'Total', value: postStats.total, color: 'text-white', icon: FileText, f: 'all' as const },
              { label: 'Published', value: postStats.published, color: 'text-green-400', icon: CheckCircle, f: 'published' as const },
              { label: 'Removed', value: postStats.removed, color: 'text-red-400', icon: XCircle, f: 'removed' as const },
            ]).map(({ label, value, color, icon: Icon, f }) => (
              <button
                key={label}
                onClick={() => setPostFilter(f)}
                className={`rounded-2xl p-4 border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60 ${
                  postFilter === f
                    ? f === 'all' ? 'bg-[#1a1a1a] border-white/20'
                    : f === 'published' ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                    : 'bg-[#121212] border-white/5 hover:bg-[#181818]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-3 ${postFilter === f ? color : 'text-white/30'}`} aria-hidden="true" />
                <p className={`text-2xl font-bold tabular-nums ${postFilter === f ? color : 'text-white'}`}>{value}</p>
                <p className="text-[11px] text-white/40 font-medium mt-0.5">{label}</p>
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="px-5 flex gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" aria-hidden="true" />
              <input
                value={postSearch}
                onChange={e => setPostSearch(e.target.value)}
                placeholder="Search by title, category, tag…"
                aria-label="Search posts"
                className="w-full bg-[#121212] border border-white/[0.07] rounded-xl pl-10 pr-10 h-11 text-white text-[13px] placeholder-white/25 outline-none focus:border-[#ccff00]/30 transition-colors"
              />
              {postSearch && (
                <button onClick={() => setPostSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="relative" ref={postSortRef}>
              <button
                onClick={() => setShowPostSort(v => !v)}
                className="h-11 px-4 bg-[#121212] border border-white/[0.07] rounded-xl flex items-center gap-2 text-white/50 hover:text-white text-[12px] font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60"
              >
                <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
                {postSort === 'newest' ? 'Newest' : 'Oldest'}
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>
              <AnimatePresence>
                {showPostSort && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-[calc(100%+8px)] w-36 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-xl z-30 overflow-hidden">
                    {(['newest', 'oldest'] as const).map(val => (
                      <button key={val} onClick={() => { setPostSort(val); setShowPostSort(false); }}
                        className={`w-full px-4 py-3 text-left text-[12px] font-semibold capitalize transition-colors ${postSort === val ? 'text-[#ccff00] bg-[#ccff00]/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                        {val === 'newest' ? 'Newest First' : 'Oldest First'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Posts list */}
          <div className="px-5 space-y-3 pb-10">
            {filteredPosts.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center gap-3">
                <FileText className="w-10 h-10 text-white/10" aria-hidden="true" />
                <p className="text-white/30 text-sm font-medium">No posts match this filter</p>
              </div>
            ) : (
              filteredPosts.map(p => {
                const isRemoved = p.moderationStatus === 'removed';
                const processing = processingPostId === p.id;
                const thumb = p.imageUrls?.[0] || p.imageUrl;
                return (
                  <div key={p.id} className={`bg-[#111] border rounded-2xl p-4 flex gap-4 items-start transition-all ${isRemoved ? 'border-red-500/20 opacity-70' : 'border-white/[0.06]'}`}>
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#1a1a1a] flex items-center justify-center">
                      {thumb
                        ? <img src={thumb} alt="" className={`w-full h-full object-cover ${isRemoved ? 'grayscale' : ''}`} />
                        : <FileText className="w-6 h-6 text-white/15" aria-hidden="true" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-[13px] text-white leading-snug line-clamp-2">{p.title || 'Untitled'}</h3>
                        <StatusBadge status={isRemoved ? 'removed' : 'published'} />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-2.5">
                        {p.category && (
                          <span className="text-[9px] font-black uppercase tracking-widest bg-[#ccff00]/10 text-[#ccff00]/70 px-2 py-0.5 rounded-full border border-[#ccff00]/15">
                            {p.category}
                          </span>
                        )}
                        <span className="text-[10px] text-white/30 font-mono">{timeAgo(p.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-white/40 mb-3">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" aria-hidden="true" />{p.viewsCount ?? 0}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" aria-hidden="true" />{p.commentsCount ?? 0}</span>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {isRemoved ? (
                          <button
                            onClick={() => restorePost(p.id)}
                            disabled={processing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-[11px] font-bold transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/40"
                          >
                            {processing ? <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" /> : <CheckCircle className="w-3 h-3" aria-hidden="true" />}
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => removePost(p.id)}
                            disabled={processing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-[11px] font-bold transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40"
                          >
                            {processing ? <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" /> : <XCircle className="w-3 h-3" aria-hidden="true" />}
                            Remove
                          </button>
                        )}
                        <button
                          onClick={() => deletePost(p.id)}
                          disabled={processing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-bold transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                        >
                          <Trash2 className="w-3 h-3" aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ── COMMENTS panel ──────────────────────────────────── */}
      {subTab === 'comments' && (
        <>
          {/* Stats */}
          <div className="px-5 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {([
              { label: 'Total',    value: commentStats.total,    color: 'text-white',        icon: MessageSquare, f: 'all' as const },
              { label: 'Approved', value: commentStats.approved, color: 'text-green-400',    icon: CheckCircle,   f: 'approved' as const },
              { label: 'Pending',  value: commentStats.pending,  color: 'text-yellow-400',   icon: AlertTriangle, f: 'pending' as const },
              { label: 'Removed',  value: commentStats.removed,  color: 'text-red-400',      icon: XCircle,       f: 'removed' as const },
            ]).map(({ label, value, color, icon: Icon, f }) => (
              <button key={label} onClick={() => setCommentFilter(f)}
                className={`rounded-2xl p-4 border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60 ${
                  commentFilter === f
                    ? f === 'all' ? 'bg-[#1a1a1a] border-white/20'
                    : f === 'approved' ? 'bg-green-500/10 border-green-500/20'
                    : f === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                    : 'bg-[#121212] border-white/5 hover:bg-[#181818]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-3 ${commentFilter === f ? color : 'text-white/30'}`} aria-hidden="true" />
                <p className={`text-2xl font-bold tabular-nums ${commentFilter === f ? color : 'text-white'}`}>{value}</p>
                <p className="text-[11px] text-white/40 font-medium mt-0.5">{label}</p>
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="px-5 flex gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" aria-hidden="true" />
              <input
                value={commentSearch}
                onChange={e => setCommentSearch(e.target.value)}
                placeholder="Search comment text, user, post…"
                aria-label="Search comments"
                className="w-full bg-[#121212] border border-white/[0.07] rounded-xl pl-10 pr-10 h-11 text-white text-[13px] placeholder-white/25 outline-none focus:border-[#ccff00]/30 transition-colors"
              />
              {commentSearch && (
                <button onClick={() => setCommentSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="relative" ref={commentSortRef}>
              <button onClick={() => setShowCommentSort(v => !v)}
                className="h-11 px-4 bg-[#121212] border border-white/[0.07] rounded-xl flex items-center gap-2 text-white/50 hover:text-white text-[12px] font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60">
                <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
                {commentSort === 'newest' ? 'Newest' : 'Oldest'}
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>
              <AnimatePresence>
                {showCommentSort && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-[calc(100%+8px)] w-36 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-xl z-30 overflow-hidden">
                    {(['newest', 'oldest'] as const).map(val => (
                      <button key={val} onClick={() => { setCommentSort(val); setShowCommentSort(false); }}
                        className={`w-full px-4 py-3 text-left text-[12px] font-semibold capitalize transition-colors ${commentSort === val ? 'text-[#ccff00] bg-[#ccff00]/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                        {val === 'newest' ? 'Newest First' : 'Oldest First'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Comments list */}
          <div className="px-5 space-y-3 pb-10">
            {commentsLoading ? (
              <div className="py-16 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white/20 animate-spin" aria-label="Loading comments" />
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center gap-3">
                <MessageSquare className="w-10 h-10 text-white/10" aria-hidden="true" />
                <p className="text-white/30 text-sm font-medium">No comments match this filter</p>
              </div>
            ) : (
              filteredComments.map(c => {
                const processing = processingCommentId === c.id;
                const status = c.status ?? 'approved';
                const isRemoved = status === 'removed';
                const isPending = status === 'pending';
                return (
                  <div key={`${c.postId}_${c.id}`} className={`bg-[#111] border rounded-2xl p-4 transition-all ${isRemoved ? 'border-red-500/15 opacity-70' : isPending ? 'border-yellow-500/20' : 'border-white/[0.06]'}`}>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {c.userAvatar ? (
                          <img src={c.userAvatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center shrink-0 text-[9px] font-bold text-[#ccff00]">
                            {(c.userName || '?').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[12px] font-bold text-white truncate">{c.userName || 'Anonymous'}</p>
                          <p className="text-[10px] text-white/30 font-mono">{timeAgo(c.createdAt)}</p>
                        </div>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    {/* Comment text */}
                    <p className="text-[13px] text-white/70 leading-relaxed mb-2 line-clamp-3">{c.text}</p>

                    {/* Post label */}
                    {c.postTitle && (
                      <p className="text-[10px] text-white/25 mb-3 truncate">
                        On: <span className="text-white/40 font-medium">{c.postTitle}</span>
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {(isPending || isRemoved) && (
                        <button onClick={() => approveComment(c)} disabled={processing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-[11px] font-bold transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400/40">
                          {processing ? <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" /> : <CheckCircle className="w-3 h-3" aria-hidden="true" />}
                          Approve
                        </button>
                      )}
                      {!isRemoved && (
                        <button onClick={() => removeComment(c)} disabled={processing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-[11px] font-bold transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40">
                          {processing ? <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" /> : <XCircle className="w-3 h-3" aria-hidden="true" />}
                          Remove
                        </button>
                      )}
                      <button onClick={() => deleteComment(c)} disabled={processing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-bold transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40">
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
