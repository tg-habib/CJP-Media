"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { auth, loginWithGoogle, logout } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Flame, LogOut, Search, Bell } from 'lucide-react';
import SearchDialog from './SearchDialog';

export default function Header({ settings }: { settings?: any }) {
  const [user, loading] = useAuthState(auth);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (pathname?.startsWith('/post/') || pathname?.startsWith('/feed') || pathname?.startsWith('/admin') || pathname?.startsWith('/profile')) return null;

  return (
    <header className="sticky top-4 z-50 flex justify-center w-full px-4 sm:px-6 pointer-events-none mb-6 transition-all duration-300">
      <div className="w-full max-w-4xl h-16 bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-between px-2 sm:px-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] pointer-events-auto">
        <Link href="/" className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-white/5 transition-colors shrink-0 ml-1 overflow-hidden">
          {settings?.avatarUrl ? (
            <img src={settings.avatarUrl} alt="CJP Media" className="w-[34px] h-[34px] rounded-full object-cover border border-[#ccff00]/50" />
          ) : (
            <Flame className="w-[22px] h-[22px] text-[#ccff00]" strokeWidth={2.5} />
          )}
        </Link>

        
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pr-1">
          <SearchDialog />
          
          {loading ? (
            <div className="w-10 h-10 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin ml-2" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link href="/notifications" className="flex items-center justify-center w-12 h-12 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-[#ccff00] rounded-full shadow-[0_0_8px_rgba(204,255,0,0.9)] animate-pulse"></span>
              </Link>
              <Link href="/dashboard" className="relative cursor-pointer focus-visible:outline-none rounded-full transition-transform hover:scale-105 hover:ring-2 hover:ring-[#ccff00] hover:ring-offset-2 hover:ring-offset-[#1a1a1a] block ml-1">
                <Avatar className="w-10 h-10 border-2 border-transparent hover:border-white/20 transition-colors">
                  <AvatarImage src={user.photoURL || "https://i.pravatar.cc/150?img=32"} className="object-cover" />
                  <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <div className="ml-2">
              <Button onClick={loginWithGoogle} className="rounded-full font-bold px-6 h-10 bg-[#ccff00] text-black hover:bg-[#bbe600] shadow-[0_4px_15px_rgba(204,255,0,0.3)] hover:shadow-[0_6px_25px_rgba(204,255,0,0.5)] transition-all transform hover:-translate-y-0.5 text-sm">
                Join
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
