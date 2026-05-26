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

export default function Header() {
  const [user, loading] = useAuthState(auth);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (pathname?.startsWith('/post/') || pathname?.startsWith('/feed') || pathname?.startsWith('/admin') || pathname?.startsWith('/profile')) return null;

  return (
    <header className="sticky top-0 z-50 flex justify-center bg-black/90 backdrop-blur-2xl border-b border-white/10">
      <div className="w-full max-w-7xl px-4 md:px-8 h-16 flex items-center justify-between mx-auto">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="bg-[#ccff00] w-9 h-9 rounded-full flex items-center justify-center rotate-[-45deg] transition-transform duration-300 hover:scale-105">
            <Flame className="w-5 h-5 text-black rotate-[45deg]" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl text-white tracking-tight hidden sm:block">
            CJP Media
          </span>
        </Link>
        
        <div className="flex items-center gap-3 shrink-0">
          <SearchDialog />
          
          {loading ? (
            <div className="w-10 h-10 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <button className="flex flex-col items-center justify-center w-10 h-10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors relative">
                <Bell className="w-[22px] h-[22px]" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#ccff00] rounded-full shadow-[0_0_8px_rgba(204,255,0,0.9)] animate-pulse"></span>
              </button>
              <Link href="/dashboard" className="relative cursor-pointer focus-visible:outline-none rounded-full transition-transform hover:scale-105 hover:ring-2 hover:ring-[#ccff00] hover:ring-offset-2 hover:ring-offset-[#050505] block">
                <Avatar className="w-10 h-10 border border-white/20 hover:border-white/40 transition-colors">
                  <AvatarImage src={user.photoURL || "https://i.pravatar.cc/150?img=32"} className="object-cover" />
                  <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <div>
              <Button onClick={loginWithGoogle} className="rounded-full font-bold px-6 h-10 bg-[#ccff00] text-black hover:bg-[#bbe600] shadow-[0_4px_15px_rgba(204,255,0,0.3)] hover:shadow-[0_6px_25px_rgba(204,255,0,0.5)] transition-all transform hover:-translate-y-0.5">
                Join Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
