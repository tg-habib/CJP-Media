"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { ArrowLeft, Bell, Flame, Heart, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function NotificationsClient() {
  const [user, loading] = useAuthState(auth);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#050505] pb-24">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white tracking-tight">Notifications</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Empty state for notifications */}
        <div className="bg-[#121212]/80 border border-white/5 rounded-[24px] p-8 flex flex-col items-center justify-center text-center gap-4 mt-8">
          <div className="w-16 h-16 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
            <Bell className="w-8 h-8 text-[#ccff00]" />
          </div>
          <h2 className="text-xl font-bold text-white">All caught up!</h2>
          <p className="text-white/50 text-sm max-w-sm font-medium">
            You don't have any new notifications right now. Check back later for updates, likes, and comments on your activity.
          </p>
        </div>
      </div>
    </div>
  );
}
