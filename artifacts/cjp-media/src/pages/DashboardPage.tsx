import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Link } from 'wouter';
import { Bookmark, Heart, LogOut, ChevronRight, Shield, RefreshCw, Flame } from 'lucide-react';
import AuthGate from '../components/AuthGate';
import BottomNav from '../components/BottomNav';

type Tab = 'profile' | 'bookmarks' | 'likes' | 'settings';

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const qBookmarks = query(collection(db, 'users', user.uid, 'bookmarks'), orderBy('savedAt', 'desc'));
    const unsubBookmarks = onSnapshot(qBookmarks, (snap) => {
      setBookmarks(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    });

    const qLikes = query(collection(db, 'users', user.uid, 'likes'), orderBy('likedAt', 'desc'));
    const unsubLikes = onSnapshot(qLikes, (snap) => {
      setLikes(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    }, () => {});

    return () => {
      unsubBookmarks();
      unsubLikes();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <RefreshCw className="w-7 h-7 animate-spin text-[#ccff00]" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthGate
          title="Your Account"
          message="Sign in to view your profile, bookmarks, liked posts, and account settings."
        />
        <BottomNav />
      </>
    );
  }

  const isAdmin = user.email === 'tgff28970@gmail.com';
  const initials = user.displayName?.charAt(0) || user.email?.charAt(0) || 'U';

  return (
    <div className="min-h-screen bg-[#050505] pb-28 sm:pb-10">
      <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 h-14 flex items-center justify-between">
        <h1 className="text-white font-bold text-lg tracking-tight">Account</h1>
        {isAdmin && (
          <span className="text-[11px] font-bold tracking-widest text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/20 px-2.5 py-1 rounded-full uppercase">
            Admin
          </span>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="px-4 pt-6 pb-5 flex items-center gap-4 border-b border-white/[0.06]">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#ccff00]/30 bg-[#ccff00]/10 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(204,255,0,0.12)]">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-[#ccff00]">{initials.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-black text-xl tracking-tight truncate">
              {user.displayName || 'Anonymous User'}
            </h2>
            <p className="text-white/40 text-sm truncate">{user.email}</p>
            <span className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-[#ccff00] bg-[#ccff00]/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#ccff00] rounded-full animate-pulse" />
              Active Supporter
            </span>
          </div>
        </div>

        <div className="flex border-b border-white/[0.06]">
          {(['profile', 'bookmarks', 'likes', 'settings'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors relative ${
                activeTab === tab ? 'text-[#ccff00]' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {tab === 'bookmarks' && bookmarks.length > 0 ? (
                <span>
                  {tab}
                  <span className="ml-1 text-[9px] bg-[#ccff00]/20 text-[#ccff00] px-1 py-0.5 rounded-full">
                    {bookmarks.length}
                  </span>
                </span>
              ) : tab === 'likes' && likes.length > 0 ? (
                <span>
                  {tab}
                  <span className="ml-1 text-[9px] bg-[#ccff00]/20 text-[#ccff00] px-1 py-0.5 rounded-full">
                    {likes.length}
                  </span>
                </span>
              ) : tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#ccff00] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="px-4 py-4">
          {activeTab === 'profile' && (
            <div className="space-y-3">
              <div className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="px-4 py-3.5 border-b border-white/[0.04]">
                  <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-1">Account ID</p>
                  <p className="font-mono text-xs text-white/60 break-all">{user.uid}</p>
                </div>
                <div className="px-4 py-3.5 border-b border-white/[0.04]">
                  <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm text-white font-medium">{user.email}</p>
                </div>
                <div className="px-4 py-3.5">
                  <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-1">Provider</p>
                  <p className="text-sm text-white font-medium capitalize">
                    {user.providerData?.[0]?.providerId?.replace('.com', '') || 'Google'}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <a
                  href="/admin"
                  className="flex items-center justify-between px-4 py-4 bg-[#ccff00]/5 border border-[#ccff00]/15 rounded-2xl hover:bg-[#ccff00]/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#ccff00]/15 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[#ccff00]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Admin Panel</p>
                      <p className="text-white/40 text-xs">Manage posts and content</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#ccff00] group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              <div className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden">
                <p className="text-center text-white/25 text-xs py-6 font-medium">More profile features coming soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="space-y-2">
              {bookmarks.length === 0 ? (
                <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-white/30" />
                  </div>
                  <div>
                    <p className="text-white font-bold mb-1">No bookmarks yet</p>
                    <p className="text-white/40 text-sm">Tap the bookmark icon on any post to save it here.</p>
                  </div>
                  <Link
                    href="/feed"
                    className="px-5 py-2.5 bg-[#ccff00] text-black font-bold rounded-full text-sm hover:bg-[#bbe600] transition-colors"
                  >
                    Browse Feed
                  </Link>
                </div>
              ) : (
                bookmarks.map((bm) => (
                  <Link
                    key={bm.postId}
                    href={`/post/${bm.postId}`}
                    className="flex gap-3 bg-[#111111] border border-white/[0.06] rounded-2xl p-3 hover:border-white/15 transition-all group active:scale-[0.98]"
                  >
                    {bm.imageUrl ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#0a0a0a]">
                        <img
                          src={bm.imageUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl shrink-0 bg-[#1a1a1a] flex items-center justify-center">
                        <Bookmark className="w-5 h-5 text-white/20" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <p className="text-white font-semibold text-sm line-clamp-2 group-hover:text-[#ccff00] transition-colors leading-snug">
                        {bm.title}
                      </p>
                      {bm.category && (
                        <span className="text-[11px] text-[#ccff00]/60 font-bold uppercase tracking-wide">
                          {bm.category}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 self-center shrink-0 group-hover:text-[#ccff00] transition-colors" />
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === 'likes' && (
            <div className="space-y-2">
              {likes.length === 0 ? (
                <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white/30" />
                  </div>
                  <div>
                    <p className="text-white font-bold mb-1">No liked posts yet</p>
                    <p className="text-white/40 text-sm">Posts you react to will appear here.</p>
                  </div>
                  <Link
                    href="/feed"
                    className="px-5 py-2.5 bg-[#ccff00] text-black font-bold rounded-full text-sm hover:bg-[#bbe600] transition-colors"
                  >
                    Browse Feed
                  </Link>
                </div>
              ) : (
                likes.map((lk) => (
                  <Link
                    key={lk.postId || lk.id}
                    href={`/post/${lk.postId || lk.id}`}
                    className="flex gap-3 bg-[#111111] border border-white/[0.06] rounded-2xl p-3 hover:border-white/15 transition-all group active:scale-[0.98]"
                  >
                    {lk.imageUrl ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#0a0a0a]">
                        <img
                          src={lk.imageUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl shrink-0 bg-[#1a1a1a] flex items-center justify-center">
                        <Flame className="w-5 h-5 text-white/20" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <p className="text-white font-semibold text-sm line-clamp-2 group-hover:text-[#ccff00] transition-colors leading-snug">
                        {lk.title}
                      </p>
                      {lk.category && (
                        <span className="text-[11px] text-[#ccff00]/60 font-bold uppercase tracking-wide">
                          {lk.category}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 self-center shrink-0 group-hover:text-[#ccff00] transition-colors" />
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-3">
              <div className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
                {[
                  { label: 'Email Notifications', desc: 'Receive updates via email', on: true },
                  { label: 'Direct Messages', desc: 'Allow users to message you', on: true },
                  { label: 'Private Account', desc: 'Only followers see your posts', on: false },
                ].map(({ label, desc, on }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-4">
                    <div>
                      <p className="text-white font-semibold text-sm">{label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full relative transition-colors ${on ? 'bg-[#ccff00]' : 'bg-white/10'}`}>
                      <div className={`w-5 h-5 bg-black rounded-full absolute top-0.5 transition-all ${on ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => auth.signOut()}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/15 active:scale-[0.98] transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
