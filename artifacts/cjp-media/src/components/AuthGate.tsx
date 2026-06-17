import { useState } from 'react';
import { Flame } from 'lucide-react';
import AuthModal from './AuthModal';

interface AuthGateProps {
  title?: string;
  message?: string;
}

export default function AuthGate({
  title = 'Join the Movement',
  message = 'Sign in to access this page and be part of the conversation.',
}: AuthGateProps) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-8 px-6 text-center pb-28 sm:pb-0">
        <div className="flex flex-col items-center gap-5 max-w-xs">
          <div className="w-20 h-20 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center shadow-[0_0_40px_rgba(204,255,0,0.08)]">
            <Flame className="w-9 h-9 text-[#ccff00]" strokeWidth={2} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h2>
            <p className="text-white/40 text-sm leading-relaxed">{message}</p>
          </div>

          <div className="flex flex-col gap-2.5 w-full">
            <button
              onClick={() => setAuthOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ccff00] text-black font-bold rounded-full hover:bg-white active:scale-[0.97] transition-all text-[14px]"
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white/[0.04] border border-white/10 text-white/70 font-medium rounded-full hover:bg-white/[0.07] active:scale-[0.97] transition-all text-[14px]"
            >
              Create Account
            </button>
          </div>

          <p className="text-white/20 text-xs">
            Free forever. No spam. Just satire.
          </p>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
