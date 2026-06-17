import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { ArrowLeft, MessageSquare, Search, RefreshCw } from 'lucide-react';
import AuthGate from '../components/AuthGate';
import BottomNav from '../components/BottomNav';

export default function MessagesPage() {
  const [user, loading] = useAuthState(auth);

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
          title="Your Messages"
          message="Sign in to send and receive direct messages from other supporters."
        />
        <BottomNav />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-28 sm:pb-10">
      <div className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/15 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-white font-bold text-lg tracking-tight">Messages</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-[#111111] rounded-full px-4 border border-white/[0.06] flex items-center h-12 transition-colors focus-within:border-[#ccff00]/30 mb-6">
          <Search className="w-4 h-4 text-white/30 shrink-0" />
          <input
            type="text"
            placeholder="Search messages..."
            className="bg-transparent border-none outline-none text-[14px] text-white placeholder-white/25 w-full pl-3 font-medium"
          />
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-[24px] p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/10 flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-[#ccff00]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-1">No messages yet</h2>
            <p className="text-white/40 text-sm max-w-xs font-medium leading-relaxed">
              Connect with other supporters to start conversations.
            </p>
          </div>
          <button className="mt-2 px-6 py-2.5 rounded-full bg-[#ccff00] text-black font-bold text-sm hover:bg-[#bbe600] active:scale-[0.97] transition-all">
            New Message
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
