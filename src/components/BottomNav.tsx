"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  
  if (pathname?.startsWith('/post/') || pathname?.startsWith('/admin')) return null;

  const isAdmin = user?.email === 'tgff28970@gmail.com';

  return (
    <div className="fixed sm:hidden bottom-4 left-4 right-4 z-50">
      <div className="flex items-center justify-around bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-2 shadow-2xl">
        <Link href="/" className="flex items-center justify-center p-3 rounded-full hover:bg-white/5 hover:text-[#ccff00] transition-colors">
          <Home className={`w-[24px] h-[24px] ${pathname === '/' ? 'text-[#ccff00]' : 'text-white/60'}`} />
        </Link>
        <Link href="/feed" className="flex items-center justify-center p-3 rounded-full hover:bg-white/5 hover:text-[#ccff00] transition-colors">
          <Compass className={`w-[24px] h-[24px] ${pathname === '/feed' ? 'text-[#ccff00]' : 'text-white/60'}`} />
        </Link>

        {isAdmin && (
          <Link href="/admin" className="flex items-center justify-center p-3 rounded-full hover:bg-white/5 transition-colors">
             <Plus className="w-[24px] h-[24px] text-white/60 hover:text-white" />
          </Link>
        )}

        <Link 
          href="/messages"
          className="flex items-center justify-center p-3 rounded-full hover:bg-white/5 hover:text-white transition-colors"
        >
          <MessageSquare className={`w-[24px] h-[24px] ${pathname === '/messages' ? 'text-[#ccff00]' : 'text-white/60'}`} />
        </Link>
        <Link 
          href="/dashboard" 
          className="flex items-center justify-center p-3 rounded-full hover:bg-white/5 hover:text-[#ccff00] transition-colors"
        >
          <User className={`w-[24px] h-[24px] ${pathname === '/dashboard' ? 'text-[#ccff00]' : 'text-white/60'}`} />
        </Link>
      </div>
    </div>
  );
}
