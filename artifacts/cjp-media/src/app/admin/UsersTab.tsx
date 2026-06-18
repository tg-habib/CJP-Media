import { useState, useEffect, useRef } from 'react';
import {
  collection, onSnapshot, doc, updateDoc, deleteDoc,
  setDoc, getDocs, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Search, Ban, Trash2, ChevronDown, X, ExternalLink,
  RefreshCw, User, Calendar, Heart, Bookmark,
  CheckCircle, Crown, Eye, Filter,
  ArrowUpDown, UserCheck, UserX, Users, ShieldCheck,
  Mail, Clock, Activity, ChevronRight, Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

type UserRecord = {
  uid: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: any;
  updatedAt?: any;
  banned?: boolean;
  bannedReason?: string;
  bannedAt?: any;
  isAdmin?: boolean;
  bookmarksCount?: number;
  likesCount?: number;
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

function formatDate(ts: any): string {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Avatar({ user, size = 'md' }: { user: UserRecord; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };
  const initials = (user.displayName || user.email || '?').slice(0, 2).toUpperCase();
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt={user.displayName} className={`${sizes[size]} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center font-bold text-[#ccff00] shrink-0`}>
      {initials}
    </div>
  );
}

type DrawerUser = UserRecord & { posts?: any[] };

function UserDrawer({ user, onClose, onBan, onUnban, onMakeAdmin, onRevokeAdmin, onDelete }: {
  user: DrawerUser;
  onClose: () => void;
  onBan: (uid: string, reason: string) => void;
  onUnban: (uid: string) => void;
  onMakeAdmin: (uid: string) => void;
  onRevokeAdmin: (uid: string) => void;
  onDelete: (uid: string) => void;
}) {
  const [banReason, setBanReason] = useState('');
  const [showBanForm, setShowBanForm] = useState(false);
  const [tab, setTab] = useState<'overview' | 'activity'>('overview');

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 260 }}
      className="fixed inset-y-0 right-0 z-[60] w-full max-w-[420px] bg-[#0e0e0e] border-l border-white/[0.07] overflow-y-auto shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] sticky top-0 bg-[#0e0e0e] z-10">
        <span className="text-[11px] font-bold text-white/30 uppercase tracking-[0.15em]">User Details</span>
        <button
          onClick={onClose}
          aria-label="Close user details panel"
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60"
        >
          <X className="w-4 h-4 text-white/50" aria-hidden="true" />
        </button>
      </div>

      {/* Profile */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="flex items-start gap-4">
          <Avatar user={user} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-[16px] leading-tight">{user.displayName || 'Anonymous'}</h3>
              {user.isAdmin && (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 px-2 py-0.5 rounded-full">
                  <Crown className="w-2.5 h-2.5" /> Admin
                </span>
              )}
              {user.banned && (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                  <Ban className="w-2.5 h-2.5" /> Banned
                </span>
              )}
            </div>
            <p className="text-white/40 text-[12px] mt-0.5 truncate">{user.email || '—'}</p>
            <p className="text-white/25 text-[11px] mt-1">UID: <span className="font-mono text-[10px]">{user.uid.slice(0, 12)}…</span></p>
          </div>
        </div>

        {user.bio && (
          <p className="mt-4 text-white/40 text-[12px] leading-relaxed bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">{user.bio}</p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { icon: Bookmark, label: 'Bookmarks', value: user.bookmarksCount ?? '—', color: 'text-blue-400' },
            { icon: Heart, label: 'Likes', value: user.likesCount ?? '—', color: 'text-orange-400' },
            { icon: Calendar, label: 'Joined', value: formatDate(user.createdAt), color: 'text-[#ccff00]' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-center">
              <Icon className={`w-3.5 h-3.5 mx-auto mb-1.5 ${color}`} />
              <p className="text-white font-bold text-[13px] tabular-nums">{value}</p>
              <p className="text-white/30 text-[9px] font-semibold uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.06]">
        {(['overview', 'activity'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${tab === t ? 'text-[#ccff00] border-b-2 border-[#ccff00]' : 'text-white/30 hover:text-white/60'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 px-6 py-5 space-y-4">
        {tab === 'overview' && (
          <>
            {/* Meta info */}
            <div className="space-y-2.5">
              {[
                { label: 'Email', value: user.email, icon: Mail },
                { label: 'Last Active', value: timeAgo(user.updatedAt || user.createdAt), icon: Clock },
                { label: 'Account Status', value: user.banned ? 'Banned' : 'Active', icon: Activity },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2.5 text-white/40">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">{label}</span>
                  </div>
                  <span className={`text-[12px] font-semibold ${label === 'Account Status' ? (user.banned ? 'text-red-400' : 'text-green-400') : 'text-white/70'}`}>{value || '—'}</span>
                </div>
              ))}
            </div>

            {user.banned && user.bannedReason && (
              <div className="bg-red-500/[0.07] border border-red-500/20 rounded-xl p-4">
                <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest mb-1.5">Ban Reason</p>
                <p className="text-[12px] text-red-300/80 leading-relaxed">{user.bannedReason}</p>
                {user.bannedAt && <p className="text-[10px] text-red-400/40 mt-2">Banned {timeAgo(user.bannedAt)}</p>}
              </div>
            )}

            <a href={`/user/${user.uid}`} target="_blank" rel="noreferrer"
              className="flex items-center justify-between w-full py-3 px-4 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] transition-colors group">
              <span className="text-[12px] font-semibold text-white/60 group-hover:text-white transition-colors">View Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
            </a>
          </>
        )}

        {tab === 'activity' && (
          <div className="space-y-3">
            {user.posts && user.posts.length > 0 ? (
              user.posts.map((p: any) => (
                <div key={p.id} className="flex gap-3 items-center bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                  {(p.imageUrls?.[0] || p.imageUrl) ? (
                    <img src={p.imageUrls?.[0] || p.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 opacity-70" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white/[0.04] shrink-0 flex items-center justify-center">
                      <Hash className="w-4 h-4 text-white/15" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white/80 truncate">{p.title}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{formatDate(p.createdAt)}</p>
                    <div className="flex gap-2 mt-1 text-[10px] text-white/40">
                      <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> {p.viewsCount || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-2.5 h-2.5" /> {p.reactionsCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <Activity className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-[12px]">No posts from this user</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-5 border-t border-white/[0.06] space-y-3 sticky bottom-0 bg-[#0e0e0e]">
        {showBanForm ? (
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold text-red-400/80 uppercase tracking-wider">Ban Reason (optional)</p>
            <textarea
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              rows={2}
              placeholder="Reason for banning this user…"
              className="w-full bg-red-500/[0.05] border border-red-500/20 rounded-xl px-4 py-3 text-white text-[12px] placeholder-white/20 outline-none focus:border-red-500/40 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => { onBan(user.uid, banReason); setShowBanForm(false); setBanReason(''); }}
                className="flex-1 py-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold text-[12px] rounded-xl transition-colors">
                Confirm Ban
              </button>
              <button onClick={() => setShowBanForm(false)}
                className="px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-white/50 font-bold text-[12px] rounded-xl transition-colors hover:bg-white/[0.07]">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {user.banned ? (
              <button onClick={() => onUnban(user.uid)}
                className="w-full py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-bold text-[12px] rounded-xl transition-colors flex items-center justify-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" /> Unban User
              </button>
            ) : (
              <button onClick={() => setShowBanForm(true)}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-[12px] rounded-xl transition-colors flex items-center justify-center gap-2">
                <Ban className="w-3.5 h-3.5" /> Ban User
              </button>
            )}

            {user.isAdmin ? (
              <button onClick={() => onRevokeAdmin(user.uid)}
                className="w-full py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 font-bold text-[12px] rounded-xl transition-colors flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Revoke Admin
              </button>
            ) : (
              <button onClick={() => onMakeAdmin(user.uid)}
                className="w-full py-3 bg-[#ccff00]/10 hover:bg-[#ccff00]/20 border border-[#ccff00]/20 text-[#ccff00] font-bold text-[12px] rounded-xl transition-colors flex items-center justify-center gap-2">
                <Crown className="w-3.5 h-3.5" /> Make Admin
              </button>
            )}

            <button onClick={() => { if (confirm('Permanently delete this user profile from the platform?')) onDelete(user.uid); }}
              className="w-full py-3 bg-white/[0.03] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 text-white/30 hover:text-red-400 font-bold text-[12px] rounded-xl transition-all flex items-center justify-center gap-2">
              <Trash2 className="w-3.5 h-3.5" /> Delete Account
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function UsersTab({ setIsMobileMenuOpen }: { setIsMobileMenuOpen: (v: boolean) => void }) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [admins, setAdmins] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'banned' | 'admins'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [selectedUser, setSelectedUser] = useState<DrawerUser | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      const list = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserRecord));
      setUsers(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'admins'), snap => {
      setAdmins(new Set(snap.docs.map(d => d.id)));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const enrichedUsers = users.map(u => ({ ...u, isAdmin: admins.has(u.uid) }));

  const filtered = enrichedUsers
    .filter(u => {
      if (filter === 'banned') return u.banned;
      if (filter === 'active') return !u.banned;
      if (filter === 'admins') return u.isAdmin;
      return true;
    })
    .filter(u => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === 'name') return (a.displayName || '').localeCompare(b.displayName || '');
      if (sort === 'oldest') {
        const aT = a.createdAt?.toDate?.()?.getTime() ?? 0;
        const bT = b.createdAt?.toDate?.()?.getTime() ?? 0;
        return aT - bT;
      }
      const aT = a.createdAt?.toDate?.()?.getTime() ?? 0;
      const bT = b.createdAt?.toDate?.()?.getTime() ?? 0;
      return bT - aT;
    });

  const stats = {
    total: enrichedUsers.length,
    active: enrichedUsers.filter(u => !u.banned).length,
    banned: enrichedUsers.filter(u => u.banned).length,
    admins: enrichedUsers.filter(u => u.isAdmin).length,
  };

  const openDrawer = async (user: UserRecord) => {
    setSelectedUser({ ...user });
    setDrawerLoading(true);
    try {
      const [bookmarksSnap, likesSnap] = await Promise.all([
        getDocs(collection(db, 'users', user.uid, 'bookmarks')),
        getDocs(collection(db, 'users', user.uid, 'likes')),
      ]);
      setSelectedUser(u => u ? {
        ...u,
        bookmarksCount: bookmarksSnap.size,
        likesCount: likesSnap.size,
      } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleBan = async (uid: string, reason: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        banned: true,
        bannedReason: reason || '',
        bannedAt: serverTimestamp(),
      });
      setSelectedUser(u => u ? { ...u, banned: true, bannedReason: reason } : null);
      toast.success('User banned');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUnban = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { banned: false, bannedReason: '', bannedAt: null });
      setSelectedUser(u => u ? { ...u, banned: false } : null);
      toast.success('User unbanned');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleMakeAdmin = async (uid: string) => {
    try {
      const userDoc = users.find(u => u.uid === uid);
      await setDoc(doc(db, 'admins', uid), { email: userDoc?.email || '', grantedAt: serverTimestamp() });
      setSelectedUser(u => u ? { ...u, isAdmin: true } : null);
      toast.success('Admin role granted');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRevokeAdmin = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'admins', uid));
      setSelectedUser(u => u ? { ...u, isAdmin: false } : null);
      toast.success('Admin role revoked');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      setSelectedUser(null);
      toast.success('User profile deleted');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="min-h-screen bg-black text-white w-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-white lg:hidden">
            <Filter className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <p className="text-white/30 text-[13px]">Monitor, moderate and manage all platform users</p>
      </div>

      {/* Stats Bar */}
      <div className="px-5 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', filter: 'all' as const },
          { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', filter: 'active' as const },
          { label: 'Banned', value: stats.banned, icon: UserX, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', filter: 'banned' as const },
          { label: 'Admins', value: stats.admins, icon: Crown, color: 'text-[#ccff00]', bg: 'bg-[#ccff00]/10 border-[#ccff00]/20', filter: 'admins' as const },
        ].map(({ label, value, icon: Icon, color, bg, filter: f }) => (
          <button key={label} onClick={() => setFilter(f)}
            className={`rounded-2xl p-4 border text-left transition-all ${filter === f ? bg : 'bg-[#121212] border-white/5 hover:bg-[#181818]'}`}>
            <Icon className={`w-4 h-4 mb-3 ${filter === f ? color : 'text-white/30'}`} />
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
            placeholder="Search by name, email, UID…"
            className="w-full bg-[#121212] border border-white/[0.07] rounded-xl pl-10 pr-4 h-11 text-white text-[13px] placeholder-white/25 outline-none focus:border-[#ccff00]/30 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative" ref={sortRef}>
          <button onClick={() => setShowSortMenu(v => !v)}
            className="h-11 px-4 bg-[#121212] border border-white/[0.07] rounded-xl flex items-center gap-2 text-white/50 hover:text-white text-[12px] font-semibold transition-colors whitespace-nowrap">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sort === 'newest' ? 'Newest' : sort === 'oldest' ? 'Oldest' : 'Name'}
            <ChevronDown className="w-3 h-3" />
          </button>
          <AnimatePresence>
            {showSortMenu && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 top-[calc(100%+8px)] w-36 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-xl z-30 overflow-hidden">
                {([['newest', 'Newest First'], ['oldest', 'Oldest First'], ['name', 'By Name']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => { setSort(val); setShowSortMenu(false); }}
                    className={`w-full px-4 py-3 text-left text-[12px] font-semibold transition-colors ${sort === val ? 'text-[#ccff00] bg-[#ccff00]/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="px-5 flex gap-2 mb-5 overflow-x-auto pb-1">
        {([
          ['all', 'All Users'],
          ['active', 'Active'],
          ['banned', 'Banned'],
          ['admins', 'Admins'],
        ] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${filter === val ? 'bg-[#ccff00] text-black border-[#ccff00]' : 'bg-transparent border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20'}`}>
            {label}
            <span className={`ml-1.5 tabular-nums ${filter === val ? 'text-black/50' : 'text-white/25'}`}>
              {val === 'all' ? stats.total : val === 'active' ? stats.active : val === 'banned' ? stats.banned : stats.admins}
            </span>
          </button>
        ))}
      </div>

      {/* Users List */}
      <div className="px-5 pb-10">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-[#ccff00] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 font-medium">{search ? 'No users match your search' : 'No users found'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(user => (
              <motion.div
                key={user.uid}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => openDrawer(user)}
                className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all group ${user.banned ? 'bg-red-500/[0.04] border-red-500/[0.10] hover:bg-red-500/[0.08]' : 'bg-[#121212] border-white/5 hover:bg-[#181818] hover:border-white/10'}`}
              >
                <div className="relative shrink-0">
                  <Avatar user={user} size="md" />
                  {user.banned && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center">
                      <Ban className="w-2 h-2 text-white" />
                    </div>
                  )}
                  {user.isAdmin && !user.banned && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#ccff00] rounded-full border-2 border-[#0a0a0a] flex items-center justify-center">
                      <Crown className="w-2 h-2 text-black" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-[14px] truncate">{user.displayName || 'Anonymous'}</p>
                    {user.isAdmin && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#ccff00]/60 border border-[#ccff00]/20 px-1.5 py-0.5 rounded-full shrink-0">Admin</span>
                    )}
                  </div>
                  <p className="text-white/30 text-[11px] truncate mt-0.5">{user.email || 'No email'}</p>
                  <p className="text-white/20 text-[10px] mt-1 font-mono">{formatDate(user.createdAt)}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {user.banned ? (
                    <span className="text-[10px] font-bold text-red-400/70 bg-red-500/10 border border-red-500/15 px-2.5 py-1 rounded-full">Banned</span>
                  ) : (
                    <span className="text-[10px] font-bold text-green-400/70 bg-green-500/10 border border-green-500/15 px-2.5 py-1 rounded-full">Active</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
            />
            <UserDrawer
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onBan={handleBan}
              onUnban={handleUnban}
              onMakeAdmin={handleMakeAdmin}
              onRevokeAdmin={handleRevokeAdmin}
              onDelete={handleDelete}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
