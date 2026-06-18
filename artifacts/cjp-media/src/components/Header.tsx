import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Flame, Bell } from 'lucide-react';
import SearchDialog from './SearchDialog';
import AuthModal from './AuthModal';
import ProfileSetupModal from './ProfileSetupModal';

const HIDDEN_PATHS = [
  '/post/', '/feed', '/admin', '/profile', '/dashboard',
  '/notifications', '/messages', '/user/', '/category/',
];

export default function Header({ settings }: { settings?: any }) {
  const [user, loading] = useAuthState(auth);
  const [pathname] = useLocation();
  const [authOpen, setAuthOpen] = useState(false);
  const [profileSetupOpen, setProfileSetupOpen] = useState(false);

  if (HIDDEN_PATHS.some(p => pathname?.startsWith(p))) return null;

  return (
    <>
      <header className="sticky top-4 z-50 flex justify-center w-full px-4 sm:px-6 pointer-events-none mb-6">
        <nav className="w-full max-w-4xl h-14 bg-[#111111]/90 backdrop-blur-2xl border border-white/[0.08] rounded-full flex items-center justify-between px-2 sm:px-3 shadow-[0_8px_40px_rgba(0,0,0,0.6)] pointer-events-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pl-2.5 pr-3 h-10 rounded-full hover:bg-white/5 transition-colors shrink-0 group">
            {settings?.avatarUrl ? (
              <img
                src={settings.avatarUrl}
                alt="CJP Media"
                className="w-7 h-7 rounded-full object-cover border border-[#ccff00]/40 shrink-0"
              />
            ) : (
              <Flame className="w-5 h-5 text-[#ccff00] shrink-0" strokeWidth={2.5} />
            )}
            <span className="text-white font-black text-[14px] tracking-tight whitespace-nowrap">
              CJP <span className="text-[#ccff00]">Media</span>
            </span>
          </Link>

          {/* Center nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '/', label: 'Home' },
              { href: '/feed', label: 'Feed' },
              { href: '/category/Trending', label: 'Trending' },
              { href: '/category/Politics', label: 'Politics' },
            ].map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3.5 h-8 rounded-full text-[13px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0 pr-1">
            <SearchDialog />

            {loading ? (
              <div className="w-8 h-8 rounded-full border-2 border-[#ccff00]/40 border-t-[#ccff00] animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-1">
                <Link
                  href="/notifications"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-white/50 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <Bell className="w-4.5 h-4.5" />
                </Link>
                <Link href="/dashboard" className="ml-0.5 rounded-full focus-visible:outline-none hover:ring-2 hover:ring-[#ccff00]/60 hover:ring-offset-1 hover:ring-offset-[#111] transition-all">
                  <Avatar className="w-9 h-9 border border-white/10">
                    <AvatarImage src={user.photoURL || ''} className="object-cover" />
                    <AvatarFallback className="bg-[#ccff00]/10 text-[#ccff00] text-sm font-black">
                      {user.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  onClick={() => setAuthOpen(true)}
                  className="text-white/60 hover:text-white text-[13px] font-medium px-3 h-9 rounded-full hover:bg-white/[0.06] transition-all hidden sm:flex items-center"
                >
                  Sign in
                </button>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="rounded-full font-bold px-4 h-9 bg-[#ccff00] text-black hover:bg-white transition-all text-[13px] shadow-[0_0_20px_rgba(204,255,0,0.25)]"
                >
                  Join
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSignupSuccess={() => setProfileSetupOpen(true)}
      />
      <ProfileSetupModal open={profileSetupOpen} onClose={() => setProfileSetupOpen(false)} />
    </>
  );
}
