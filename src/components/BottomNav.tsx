"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';
import { toast } from 'sonner';

export default function BottomNav() {
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  
  if (pathname?.startsWith('/post/') || pathname?.startsWith('/admin')) return null;

  const isAdmin = user?.email === 'tgff28970@gmail.com';

  return (
    <div className="fixed sm:hidden bottom-0 left-0 w-full bg-black/98 border-t border-white/10 z-50 px-4 py-2 pb-safe backdrop-blur-xl">
      <div className="flex items-center justify-around">
        <Link href="/" className="flex items-center justify-center p-3 rounded-full hover:bg-white/5 transition-colors">
          <Home className={`w-[26px] h-[26px] ${pathname === '/' ? 'text-white' : 'text-white/60'}`} />
        </Link>
        <Link href="/feed" className="flex items-center justify-center p-3 rounded-full hover:bg-white/5 transition-colors">
          <Compass className={`w-[26px] h-[26px] ${pathname === '/feed' ? 'text-white' : 'text-white/60'}`} />
        </Link>

        {isAdmin && (
          <Link href="/admin" className="flex items-center justify-center p-3 rounded-full hover:bg-white/5 transition-colors">
             <Plus className="w-[26px] h-[26px] text-white/60" />
          </Link>
        )}

        <button 
          onClick={() => toast('Under Construction')} 
          className="flex items-center justify-center p-3 rounded-full hover:bg-white/5 transition-colors"
        >
          <MessageSquare className="w-[26px] h-[26px] text-white/60" />
        </button>
        <Link 
          href="/dashboard" 
          className="flex items-center justify-center p-3 rounded-full hover:bg-white/5 transition-colors"
        >
          <User className={`w-[26px] h-[26px] ${pathname === '/dashboard' ? 'text-white' : 'text-white/60'}`} />
        </Link>
      </div>
    </div>
  );
}
