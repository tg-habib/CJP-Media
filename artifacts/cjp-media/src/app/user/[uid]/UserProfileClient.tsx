import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MessageCircle, Heart, UserRound } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export default function UserProfileClient({ uid }: { uid: string }) {
  const [currentUser] = useAuthState(auth);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    getDoc(doc(db, 'users', uid)).then((snap) => {
      if (snap.exists()) {
        setProfile({ uid, ...snap.data() });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [uid]);

  const isOwnProfile = currentUser?.uid === uid;

  let joinedText = '';
  if (profile?.createdAt) {
    try {
      const date = typeof profile.createdAt.toDate === 'function' ? profile.createdAt.toDate() : new Date(profile.createdAt);
      joinedText = formatDistanceToNow(date, { addSuffix: true });
    } catch {}
  }

  const displayName = profile?.displayName || currentUser?.displayName || 'CJP Reader';
  const avatarUrl = profile?.avatarUrl || '';
  const bio = profile?.bio || '';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
      <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-50 flex items-center justify-between px-4 h-14 border-b border-white/5">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors -ml-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-semibold text-[17px]">Profile</h1>
        <div className="w-10" />
      </div>

      <div className="w-full max-w-xl mx-auto pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Cover */}
            <div className="w-full h-[140px] bg-gradient-to-br from-[#ccff00]/10 via-[#1a1a1a] to-[#0a0a0a] relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #ccff00 0%, transparent 60%)' }} />
            </div>

            {/* Avatar + Actions */}
            <div className="px-4 relative pb-4 border-b border-white/5">
              <div className="flex justify-between items-start">
                <div className="relative -mt-[52px] z-10 shrink-0">
                  <Avatar className="w-[104px] h-[104px] border-[4px] border-[#0a0a0a] shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-[#ccff00]/10 text-[#ccff00] text-[36px] font-black border border-[#ccff00]/20">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {isOwnProfile && (
                  <div className="mt-3">
                    <button className="font-bold text-[14px] px-4 h-[36px] rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors">
                      Edit profile
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <h1 className="text-[22px] font-bold text-white leading-none">{displayName}</h1>
                <p className="text-white/40 text-[13px] mt-1">@{uid.slice(0, 8).toLowerCase()}</p>

                {bio && (
                  <p className="text-white/75 text-[15px] mt-3 leading-snug">{bio}</p>
                )}

                {joinedText && (
                  <div className="flex items-center gap-1.5 mt-3 text-white/40 text-[13px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {joinedText}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
              <div className="flex flex-col items-center py-5 gap-1">
                <span className="text-white font-bold text-[18px]">—</span>
                <span className="text-white/40 text-[12px]">Posts Liked</span>
              </div>
              <div className="flex flex-col items-center py-5 gap-1">
                <span className="text-white font-bold text-[18px]">—</span>
                <span className="text-white/40 text-[12px]">Comments</span>
              </div>
              <div className="flex flex-col items-center py-5 gap-1">
                <span className="text-white font-bold text-[18px]">—</span>
                <span className="text-white/40 text-[12px]">Bookmarks</span>
              </div>
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <UserRound className="w-8 h-8 text-white/20" />
              </div>
              <div>
                <p className="text-white/50 text-[15px] font-medium">
                  {isOwnProfile ? 'Your activity will appear here.' : `${displayName}'s activity will appear here.`}
                </p>
                <p className="text-white/25 text-[13px] mt-1">Start engaging with posts to see it.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
