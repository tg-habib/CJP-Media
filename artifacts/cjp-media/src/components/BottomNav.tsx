import { Link, useLocation } from 'wouter';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Home, Flame, Bell, MessageSquare, User } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/feed', icon: Flame, label: 'Feed' },
  { href: '/notifications', icon: Bell, label: 'Alerts' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/dashboard', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const [pathname] = useLocation();
  const [user] = useAuthState(auth);

  if (
    pathname?.startsWith('/post/') ||
    pathname?.startsWith('/admin')
  ) return null;

  return (
    <div className="fixed sm:hidden bottom-3 left-3 right-3 z-50">
      <div className="flex items-center justify-around bg-[#111111]/95 backdrop-blur-2xl border border-white/[0.08] rounded-[28px] px-1 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {tabs.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-[20px] transition-all"
            >
              <div className={`flex items-center justify-center w-10 h-8 rounded-2xl transition-all duration-200 ${isActive ? 'bg-[#ccff00]/15' : 'hover:bg-white/5'}`}>
                <Icon
                  className={`w-[22px] h-[22px] transition-colors duration-200 ${isActive ? 'text-[#ccff00]' : 'text-white/40'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`text-[10px] font-semibold tracking-tight transition-colors duration-200 ${isActive ? 'text-[#ccff00]' : 'text-white/30'}`}>
                {label}
              </span>

            </Link>
          );
        })}
      </div>
    </div>
  );
}
