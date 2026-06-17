import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useLocation } from 'wouter';
import { ArrowLeft, MessageSquare, Search } from 'lucide-react';
import { Link } from 'wouter';

export default function MessagesPage() {
  const [user, loading] = useAuthState(auth);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#050505] pb-24">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">Messages</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-[#1a1a1a]/50 rounded-full px-4 border border-white/5 flex items-center h-12 transition-colors focus-within:border-[#ccff00]/30 focus-within:bg-[#1a1a1a] mb-6">
          <Search className="w-5 h-5 text-white/40" />
          <input type="text" placeholder="Search messages..." className="bg-transparent border-none outline-none text-[15px] text-white placeholder-white/30 w-full pl-3 font-medium" />
        </div>
        <div className="bg-[#121212]/80 border border-white/5 rounded-[24px] p-8 flex flex-col items-center justify-center text-center gap-4 mt-8">
          <div className="w-16 h-16 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-[#ccff00]" />
          </div>
          <h2 className="text-xl font-bold text-white">No messages yet</h2>
          <p className="text-white/50 text-sm max-w-sm font-medium">Connect with other users to start conversations. Your private messages will appear here.</p>
          <button className="mt-4 px-6 py-2.5 rounded-full bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">New Message</button>
        </div>
      </div>
    </div>
  );
}
