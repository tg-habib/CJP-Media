import { useState, useEffect } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase';
import { User, FileText, MessageSquare, Heart, Eye, Menu, Bell, ArrowUp, TrendingUp } from 'lucide-react';

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function getCurrentWeekRange(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${fmt(mon)} — ${fmt(sun)}`;
}

function safeDate(ts: any): Date | null {
  if (!ts) return null;
  if (ts?.toDate) return ts.toDate();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

export default function DashboardTab({
  posts,
  setActiveTab,
  setIsMobileMenuOpen,
}: {
  posts: any[];
  setActiveTab: (tab: string) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}) {
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    getCountFromServer(collection(db, 'users'))
      .then(snap => setUserCount(snap.data().count))
      .catch(() => setUserCount(null));
  }, []);

  const totalPosts = posts.length;
  const totalReactions = posts.reduce((sum, p) => sum + (p.reactionsCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
  const totalViews = posts.reduce((sum, p) => sum + (p.viewsCount || 0), 0);

  // Build a 7-day posts-created sparkline
  const today = new Date();
  const days: { label: string; short: string; posts: number; reactions: number; comments: number }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      short: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      posts: 0,
      reactions: 0,
      comments: 0,
    };
  });

  posts.forEach(p => {
    const d = safeDate(p.createdAt);
    if (!d) return;
    const daysAgo = Math.floor((today.getTime() - d.getTime()) / 86400000);
    const idx = 6 - daysAgo;
    if (idx >= 0 && idx < 7) {
      days[idx].posts += 1;
      days[idx].reactions += p.reactionsCount || 0;
      days[idx].comments += p.commentsCount || 0;
    }
  });

  const maxPosts = Math.max(...days.map(d => d.posts), 1);

  const statCards = [
    {
      label: 'Total Users',
      value: userCount !== null ? formatCompact(userCount) : '—',
      icon: User,
      color: 'text-green-400',
      border: 'border-green-500/20',
      bg: 'bg-green-500/10',
      tab: 'users',
    },
    {
      label: 'Total Posts',
      value: formatCompact(totalPosts),
      icon: FileText,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
      bg: 'bg-blue-500/10',
      tab: 'manage',
    },
    {
      label: 'Comments',
      value: formatCompact(totalComments),
      icon: MessageSquare,
      color: 'text-purple-400',
      border: 'border-purple-500/20',
      bg: 'bg-purple-500/10',
      tab: 'comments',
    },
    {
      label: 'Reactions',
      value: formatCompact(totalReactions),
      icon: Heart,
      color: 'text-orange-400',
      border: 'border-orange-500/20',
      bg: 'bg-orange-500/10',
      tab: null,
    },
    {
      label: 'Views',
      value: formatCompact(totalViews),
      icon: Eye,
      color: 'text-teal-400',
      border: 'border-teal-500/20',
      bg: 'bg-teal-500/10',
      tab: null,
    },
  ];

  const topPosts = [...posts]
    .sort((a, b) => ((b.viewsCount || 0) + (b.reactionsCount || 0)) - ((a.viewsCount || 0) + (a.reactionsCount || 0)))
    .slice(0, 5);

  return (
    <div className="bg-black min-h-screen text-white font-sans w-full mx-auto relative lg:border-x border-white/5">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-white lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60 rounded-lg p-1"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
          <div className="w-10 h-10 rounded-full bg-[#ccff00] flex items-center justify-center rotate-[-45deg] shadow-[0_0_15px_rgba(204,255,0,0.3)]" aria-hidden="true">
            <svg className="w-6 h-6 text-black rotate-[45deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c-2.2 0-4-1.8-4-4a8 8 0 0 1 8-8 8 8 0 0 1 8 8c0 4.4-3.6 8-8 8-2.2 0-4-1.8-4-4z"/><path d="M12 16a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-lg leading-tight">CJP Media</p>
            <span className="text-[#ccff00] text-xs font-semibold">Admin Panel</span>
          </div>
        </div>
        <button
          className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60 rounded-lg p-1"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6 text-white" aria-hidden="true" />
        </button>
      </header>

      {/* Hero Section */}
      <div className="px-5 mt-4 flex items-start justify-between relative h-40">
        <div className="z-10 w-[60%]">
          <p className="text-2xl font-semibold mb-1">Welcome back,</p>
          <h1 className="text-4xl font-bold mb-4">Admin 👋</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Here's what's happening with CJP Media today.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-[45%] h-[120%] opacity-90 -mt-8 pointer-events-none" aria-hidden="true">
          <div className="w-full h-full bg-gradient-to-l from-[#1a1a1a] to-transparent absolute inset-0 rounded-l-full mix-blend-overlay z-10" />
          <div className="w-full h-full bg-[#111] rounded-l-full overflow-hidden relative">
            <img
              src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80"
              alt=""
              className="object-cover w-full h-full opacity-50 grayscale mix-blend-luminosity"
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 mt-2 flex items-center justify-between gap-3 relative z-20">
        <div className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium flex-1" aria-label="Current week">
          <TrendingUp className="w-4 h-4 text-white/50" aria-hidden="true" />
          <span className="text-white/80 text-sm">{getCurrentWeekRange()}</span>
        </div>
        <button
          onClick={() => setActiveTab('editor')}
          className="bg-[#ccff00] hover:bg-[#bbe600] text-black rounded-xl px-4 py-3 font-semibold text-sm flex items-center gap-2 whitespace-nowrap shadow-[0_4px_15px_rgba(204,255,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]"
        >
          <span aria-hidden="true">+</span> Create Post
        </button>
      </div>

      {/* Overview Stats */}
      <div className="px-5 mt-8 mb-6 flex items-center justify-between">
        <h2 className="font-bold text-lg">Overview</h2>
        <span className="text-white/40 text-sm">Live data</span>
      </div>

      <div className="px-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, border, bg, tab }) => (
          <div
            key={label}
            onClick={tab ? () => setActiveTab(tab) : undefined}
            role={tab ? 'button' : undefined}
            tabIndex={tab ? 0 : undefined}
            onKeyDown={tab ? (e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab(tab); } : undefined}
            aria-label={tab ? `${label}: ${value} — go to ${tab}` : undefined}
            className={`bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col items-start relative overflow-hidden ${tab ? 'cursor-pointer hover:bg-[#181818] hover:border-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60' : ''}`}
          >
            <div className="absolute top-0 right-0 p-3 opacity-[0.04] pointer-events-none" aria-hidden="true">
              <Icon className="w-16 h-16" />
            </div>
            <div className={`w-8 h-8 rounded-full border ${border} ${bg} flex items-center justify-center mb-6 z-10`}>
              <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
            </div>
            <span className="text-white/50 text-xs font-medium mb-1 z-10">{label}</span>
            <span className="text-2xl font-bold mb-2 z-10 tabular-nums">{value}</span>
            <span className="text-[#ccff00] text-xs font-semibold flex items-center gap-1 z-10">
              <ArrowUp className="w-3 h-3" aria-hidden="true" />
              Live
            </span>
          </div>
        ))}
      </div>

      {/* 7-Day Activity Chart */}
      <div className="px-5 mt-10 mb-6 flex items-center justify-between">
        <h2 className="font-bold text-lg">Posts This Week</h2>
        <span className="text-white/40 text-sm">Last 7 days</span>
      </div>

      <div className="px-5">
        <div className="w-full bg-[#121212] border border-white/5 rounded-2xl p-5">
          {totalPosts === 0 ? (
            <div className="h-32 flex items-center justify-center text-white/25 text-sm">
              No posts yet — create your first post to see activity
            </div>
          ) : (
            <div className="flex items-end gap-2 h-32" role="img" aria-label="Posts created per day over the last 7 days">
              {days.map((day, i) => {
                const heightPct = maxPosts > 0 ? (day.posts / maxPosts) * 100 : 0;
                const isToday = i === 6;
                return (
                  <div key={day.label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-24">
                      <div
                        className={`w-full rounded-lg transition-all ${isToday ? 'bg-[#ccff00]' : 'bg-white/10'}`}
                        style={{ height: `${Math.max(heightPct, day.posts > 0 ? 8 : 2)}%` }}
                        title={`${day.label}: ${day.posts} posts`}
                      />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isToday ? 'text-[#ccff00]' : 'text-white/30'}`}>
                      {day.short}
                    </span>
                    {day.posts > 0 && (
                      <span className="text-[9px] text-white/40 tabular-nums -mt-1">{day.posts}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="px-5 mt-10 mb-6 flex items-center justify-between">
        <h2 className="font-bold text-lg">Top Performing Posts</h2>
        <button
          onClick={() => setActiveTab('manage')}
          className="text-[#ccff00] text-sm font-semibold hover:text-[#bbe600] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60 rounded px-1"
        >
          View all
        </button>
      </div>

      <div className="px-5 space-y-4 mb-8">
        {topPosts.length === 0 ? (
          <div className="py-12 text-center text-white/25 text-sm">No posts yet</div>
        ) : (
          topPosts.map((p) => {
            const createdAt = safeDate(p.createdAt);
            return (
              <div key={p.id || p.title} className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#121212] relative">
                  {p.imageUrls?.[0] || p.imageUrl ? (
                    <img
                      src={p.imageUrls?.[0] || p.imageUrl}
                      alt={p.title}
                      className="object-cover w-full h-full opacity-80"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
                      <FileText className="w-6 h-6 text-white/20 opacity-50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="font-bold text-white text-[14px] leading-tight mb-1 truncate">{p.title}</h3>
                  <p className="text-white/40 text-[10px] mb-2 font-mono flex items-center gap-2 truncate">
                    {p.tags && p.tags.length > 0 && (
                      <span className="text-[#ccff00] uppercase font-bold">
                        {p.tags.slice(0, 2).map((t: string) => t.replace(/^#/, '')).join(', ')}
                      </span>
                    )}
                    {p.tags && p.tags.length > 0 && <span aria-hidden="true">•</span>}
                    <time dateTime={createdAt?.toISOString()}>
                      {createdAt ? createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </time>
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-white/60 font-medium">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" aria-hidden="true" />
                      <span>{p.viewsCount || 0}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" aria-hidden="true" />
                      <span>{p.reactionsCount || 0}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" aria-hidden="true" />
                      <span>{p.commentsCount || 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {topPosts.length > 0 && (
          <button
            onClick={() => setActiveTab('manage')}
            className="w-full mt-4 py-4 rounded-xl border border-[#ccff00]/30 hover:bg-[#ccff00]/10 text-[#ccff00] font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]/60"
          >
            View all posts
          </button>
        )}
      </div>
    </div>
  );
}
