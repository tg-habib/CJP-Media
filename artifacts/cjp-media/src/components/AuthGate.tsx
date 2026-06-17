import { loginWithGoogle } from '../firebase';
import { Flame } from 'lucide-react';

interface AuthGateProps {
  title?: string;
  message?: string;
}

export default function AuthGate({
  title = 'Join the Movement',
  message = 'Sign in to access this page and be part of the conversation.',
}: AuthGateProps) {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-8 px-6 text-center pb-28 sm:pb-0">
      <div className="flex flex-col items-center gap-5 max-w-xs">
        <div className="w-20 h-20 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center shadow-[0_0_40px_rgba(204,255,0,0.12)]">
          <Flame className="w-9 h-9 text-[#ccff00]" strokeWidth={2.5} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h2>
          <p className="text-white/50 text-sm leading-relaxed font-medium">{message}</p>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-black font-bold rounded-full hover:bg-white/90 active:scale-[0.97] transition-all text-sm shadow-lg"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-white/25 text-xs">
          Free forever. No spam. Just satire.
        </p>
      </div>
    </div>
  );
}
