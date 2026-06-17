import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, getUserBookmarks, getUserLikes } from '../../firebase';
import { useLocation, Link } from 'wouter';
import { useEffect, useState } from 'react';
import { Bookmark, Heart, Settings, LogOut, User, Flame, ExternalLink, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

type Tab = 'profile' | 'bookmarks' | 'likes' | 'settings';

function EmptyState({ icon: Icon, title, sub }: { icon: any; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-8">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
        <Icon className="w-8 h-8 text-white/20" />
      </div>
      <div>
        <p className="text-white/50 text-[15px] font-medium">{title}</p>
        <p className="text-white/25 text-[13px] mt-1">{sub}</p>
      </div>
    </div>
  );
}

function PostCard({ post, onLinkClick }: { post: any; onLinkClick?: () => void }) {
  const img = post.imageUrl || post.coverImage || post.image || `https://picsum.photos/seed/${post.postId || post.id}/200/200`;
  const href = `/post/${post.postId || post.id}`;

  return (
    <Link href={href} onClick={onLinkClick} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.04] transition-colors group border border-transparent hover:border-white/5">
      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 bg-[#1a1a1a]">
        <img src={img} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-[14px] line-clamp-2 leading-snug group-hover:text-[#ccff00] transition-colors">
          {post.title || 'Untitled'}
        </p>
        {post.category && (
          <span className="inline-block mt-1.5 text-[11px] font-bold uppercase tracking-wide text-[#ccff00]/70 bg-[#ccff00]/5 px-2 py-0.5 rounded-full">
            {post.category}
          </span>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 shrink-0 transition-colors" />
    </Link>
  );
}

export default function DashboardClient() {
  const [user, loading] = useAuthState(auth);
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'bookmarks' && bookmarks.length === 0) {
      setDataLoading(true);
      getUserBookmarks(user.uid).then(data => { setBookmarks(data); setDataLoading(false); });
    }
    if (activeTab === 'likes' && likes.length === 0) {
      setDataLoading(true);
      getUserLikes(user.uid).then(data => { setLikes(data); setDataLoading(false); });
    }
  }, [activeTab, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-8 h-8 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'bookmarks', label: 'Saved', icon: Bookmark },
    { id: 'likes', label: 'Liked', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const joinedText = user.metadata?.creationTime
    ? formatDistanceToNow(new Date(user.metadata.creationTime), { addSuffix: true })
    : '';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="w-full max-w-xl mx-auto pb-24">
        {/* Header strip */}
        <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-50 flex items-center justify-between px-4 h-14 border-b border-white/5">
          <h1 className="text-white font-bold text-[17px]">My Account</h1>
          <button
            onClick={() => { auth.signOut(); navigate('/'); }}
            className="flex items-center gap-1.5 text-red-400/80 hover:text-red-400 text-[13px] font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* Profile strip */}
        <div className="px-4 py-5 flex items-center gap-4 border-b border-white/5">
          <Avatar className="w-[56px] h-[56px] border-2 border-[#ccff00]/30 shrink-0">
            <AvatarImage src={user.photoURL || ''} className="object-cover" />
            <AvatarFallback className="bg-[#ccff00]/10 text-[#ccff00] font-black text-xl">
              {user.displayName?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-[18px] truncate">{user.displayName || 'Anonymous'}</p>
            <p className="text-white/40 text-[13px] truncate">{user.email}</p>
            {joinedText && <p className="text-white/25 text-[12px] mt-0.5">Joined {joinedText}</p>}
          </div>
          <Link
            href={`/user/${user.uid}`}
            className="flex items-center gap-1 text-[#ccff00] text-[12px] font-semibold border border-[#ccff00]/30 rounded-full px-3 h-8 hover:bg-[#ccff00]/10 transition-colors shrink-0"
          >
            View <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/5 px-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[12px] font-semibold relative transition-colors ${
                activeTab === id ? 'text-[#ccff00]' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {activeTab === id && (
                <div className="absolute bottom-0 inset-x-4 h-[2px] bg-[#ccff00] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-3">
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <h3 className="text-white font-bold text-[15px]">Account Details</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/40 text-[13px]">Display name</span>
                    <span className="text-white text-[13px] font-medium">{user.displayName || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/40 text-[13px]">Email</span>
                    <span className="text-white text-[13px] font-medium truncate max-w-[180px]">{user.email || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/40 text-[13px]">Sign-in method</span>
                    <span className="text-white text-[13px] font-medium capitalize">
                      {user.providerData?.[0]?.providerId?.replace('.com', '') || 'Email'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/40 text-[13px]">Status</span>
                    <span className="text-[#ccff00] text-[13px] font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Active Supporter
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/user/${user.uid}`}
                className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-[#ccff00]/20 transition-colors group"
              >
                <div>
                  <p className="text-white font-semibold text-[14px]">Your public profile</p>
                  <p className="text-white/40 text-[12px] mt-0.5">See how others see you</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-[#ccff00] transition-colors" />
              </Link>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div>
              {dataLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin" />
                </div>
              ) : bookmarks.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {bookmarks.map(b => <PostCard key={b.id} post={b} onLinkClick={() => {}} />)}
                </div>
              ) : (
                <EmptyState
                  icon={Bookmark}
                  title="No saved posts yet"
                  sub="Tap the bookmark icon on any post to save it here."
                />
              )}
            </div>
          )}

          {activeTab === 'likes' && (
            <div>
              {dataLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-6 h-6 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin" />
                </div>
              ) : likes.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {likes.map(l => <PostCard key={l.id} post={l} />)}
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="No liked posts yet"
                  sub="Tap the flame icon on any post to like it and see it here."
                />
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex flex-col gap-3">
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                <h3 className="text-white font-bold text-[15px]">Notifications</h3>
                {[
                  { label: 'Email notifications', desc: 'Receive updates via email', on: true },
                  { label: 'Direct messages', desc: 'Allow others to message you', on: true },
                ].map(({ label, desc, on }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-[14px] font-medium">{label}</p>
                      <p className="text-white/40 text-[12px]">{desc}</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${on ? 'bg-[#ccff00]' : 'bg-white/10'}`}>
                      <div className={`w-5 h-5 bg-black rounded-full absolute top-0.5 transition-all ${on ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                <h3 className="text-white font-bold text-[15px]">Privacy</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-[14px] font-medium">Private account</p>
                    <p className="text-white/40 text-[12px]">Only approved followers see your activity</p>
                  </div>
                  <div className="w-11 h-6 bg-white/10 rounded-full relative cursor-pointer">
                    <div className="w-5 h-5 bg-white/50 rounded-full absolute left-0.5 top-0.5" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => { auth.signOut(); navigate('/'); }}
                className="w-full py-3 rounded-2xl border border-red-500/20 text-red-400 font-semibold text-[14px] hover:bg-red-400/10 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
