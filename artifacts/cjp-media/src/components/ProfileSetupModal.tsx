import { useState } from 'react';
import { X, Loader2, Flame, CheckCircle2 } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, saveUserProfile } from '../firebase';
import { updateProfile } from 'firebase/auth';

interface ProfileSetupModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileSetupModal({ open, onClose }: ProfileSetupModalProps) {
  const [user] = useAuthState(auth);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const displayName = user?.displayName || 'Reader';

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await saveUserProfile(user.uid, {
        displayName: user.displayName || '',
        bio: bio.trim(),
        avatarUrl: user.photoURL || '',
      });
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setBio('');
        onClose();
      }, 1200);
    } catch {
      setLoading(false);
    }
    setLoading(false);
  };

  const handleSkip = () => {
    setBio('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleSkip} />

      <div className="relative w-full max-w-[420px] bg-[#0e0e0e] border border-white/[0.08] rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.7)] overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/15 flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#ccff00]" strokeWidth={2} />
            </div>
            <span className="text-white font-bold text-[15px] tracking-tight">CJP Media</span>
          </div>
          <button
            onClick={handleSkip}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-6 pb-7">
          {done ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <CheckCircle2 className="w-12 h-12 text-[#ccff00]" />
              <p className="text-white font-bold text-[18px]">Profile saved!</p>
            </div>
          ) : (
            <>
              <h2 className="text-white font-black text-[22px] tracking-tight mb-1">
                Welcome, {displayName.split(' ')[0]}!
              </h2>
              <p className="text-white/35 text-[13px] mb-6">
                Add a short bio so others know who you are. You can skip this for now.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-[12px] font-medium tracking-wide">Bio (optional)</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell the movement who you are..."
                  maxLength={160}
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/20 outline-none focus:border-[#ccff00]/40 focus:bg-white/[0.06] transition-all resize-none"
                />
                <p className="text-white/20 text-[11px] text-right">{bio.length}/160</p>
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#ccff00] text-black font-bold text-[14px] rounded-xl hover:bg-white transition-all disabled:opacity-60 mt-4"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile'}
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-3 text-white/30 hover:text-white/60 text-[13px] font-medium transition-colors mt-1"
              >
                Skip for now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
