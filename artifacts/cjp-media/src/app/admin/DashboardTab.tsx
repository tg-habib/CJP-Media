"use client";

import { Card, CardContent } from "../../components/ui/card";
import { User, FileText, MessageSquare, Heart, Eye, Menu, Bell, Calendar as CalendarIcon, ChevronDown, ArrowUp, Home, Users, BarChart2, MoreHorizontal } from 'lucide-react';


export default function DashboardTab({ posts, setActiveTab, setIsMobileMenuOpen }: { posts: any[], setActiveTab: (tab: string) => void, setIsMobileMenuOpen: (open: boolean) => void }) {
  const totalPosts = posts.length;
  const totalReactions = posts.reduce((sum, p) => sum + (p.reactionsCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);

  return (
    <div className="bg-black min-h-screen text-white font-sans w-full mx-auto relative lg:border-x border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-4">
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-white lg:hidden">
             <Menu className="w-6 h-6" />
           </button>
           <div className="w-10 h-10 rounded-full bg-[#ccff00] flex items-center justify-center rotate-[-45deg] shadow-[0_0_15px_rgba(204,255,0,0.3)]">
             <svg className="w-6 h-6 text-black rotate-[45deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c-2.2 0-4-1.8-4-4a8 8 0 0 1 8-8 8 8 0 0 1 8 8c0 4.4-3.6 8-8 8-2.2 0-4-1.8-4-4z"/><path d="M12 16a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
           </div>
           <div className="flex flex-col">
             <h1 className="font-bold text-lg leading-tight">CJP Media</h1>
             <span className="text-[#ccff00] text-xs font-semibold">Admin Panel</span>
           </div>
        </div>
        <button className="relative">
          <Bell className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-black">12</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="px-5 mt-4 flex items-start justify-between relative h-40">
        <div className="z-10 w-[60%]">
          <h2 className="text-2xl font-semibold mb-1">Welcome back,</h2>
          <h1 className="text-4xl font-bold mb-4">Admin 👋</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Here's what's happening with CJP Media today.
          </p>
        </div>
        <div className="absolute right-0 top-0 w-[45%] h-[120%] opacity-90 -mt-8 pointer-events-none">
           <div className="w-full h-full bg-gradient-to-l from-[#1a1a1a] to-transparent absolute inset-0 rounded-l-full mix-blend-overlay z-10"></div>
           <div className="w-full h-full bg-[#111] rounded-l-full overflow-hidden relative">
             <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" alt="Avatar" className="object-cover w-full h-full opacity-50 grayscale mix-blend-luminosity" />
           </div>
        </div>
      </div>

      {/* Constraints & Create */}
      <div className="px-5 mt-2 flex items-center justify-between gap-3 relative z-20">
        <button className="flex items-center gap-2 bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium flex-1">
          <CalendarIcon className="w-4 h-4 text-white/50" />
          <span className="text-white/80">May 12 - May 18, 2025</span>
          <ChevronDown className="w-4 h-4 text-white/50 ml-auto" />
        </button>
        <button onClick={() => setActiveTab('editor')} className="bg-[#ccff00] hover:bg-[#bbe600] text-black rounded-xl px-4 py-3 font-semibold text-sm flex items-center gap-2 whitespace-nowrap shadow-[0_4px_15px_rgba(204,255,0,0.2)]">
          <span>+</span> Create Post
        </button>
      </div>

      {/* Overview */}
      <div className="px-5 mt-8 mb-6 flex items-center justify-between">
        <h3 className="font-bold text-lg">Overview</h3>
        <span className="text-white/40 text-sm">Last 7 Days</span>
      </div>

      <div className="px-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col items-start relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none"><User className="w-16 h-16" /></div>
           <div className="w-8 h-8 rounded-full border border-green-500/20 bg-green-500/10 flex items-center justify-center mb-6 z-10">
             <User className="w-4 h-4 text-green-500" />
           </div>
           <span className="text-white/50 text-xs font-medium mb-1 z-10">Total Users</span>
           <span className="text-2xl font-bold mb-2 z-10">128.7K</span>
           <span className="text-[#ccff00] text-xs font-semibold flex items-center gap-1 z-10"><ArrowUp className="w-3 h-3"/> 12.5%</span>
        </div>

        {/* Card 2 */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col items-start relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none"><FileText className="w-16 h-16" /></div>
           <div className="w-8 h-8 rounded-full border border-blue-500/20 bg-blue-500/10 flex items-center justify-center mb-6 z-10">
             <FileText className="w-4 h-4 text-blue-500" />
           </div>
           <span className="text-white/50 text-xs font-medium mb-1 z-10">Total Posts</span>
           <span className="text-2xl font-bold mb-2 z-10">1.84K</span>
           <span className="text-[#ccff00] text-xs font-semibold flex items-center gap-1 z-10"><ArrowUp className="w-3 h-3"/> 8.7%</span>
        </div>

        {/* Card 3 */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col items-start relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none"><MessageSquare className="w-16 h-16" /></div>
           <div className="w-8 h-8 rounded-full border border-purple-500/20 bg-purple-500/10 flex items-center justify-center mb-6 z-10">
             <MessageSquare className="w-4 h-4 text-purple-500" />
           </div>
           <span className="text-white/50 text-xs font-medium mb-1 z-10">Comments</span>
           <span className="text-2xl font-bold mb-2 z-10">24.6K</span>
           <span className="text-[#ccff00] text-xs font-semibold flex items-center gap-1 z-10"><ArrowUp className="w-3 h-3"/> 15.3%</span>
        </div>

        {/* Card 4 */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col items-start relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none"><Heart className="w-16 h-16" /></div>
           <div className="w-8 h-8 rounded-full border border-orange-500/20 bg-orange-500/10 flex items-center justify-center mb-6 z-10">
             <Heart className="w-4 h-4 text-orange-500" />
           </div>
           <span className="text-white/50 text-xs font-medium mb-1 z-10">Likes</span>
           <span className="text-2xl font-bold mb-2 z-10">312.7K</span>
           <span className="text-[#ccff00] text-xs font-semibold flex items-center gap-1 z-10"><ArrowUp className="w-3 h-3"/> 10.1%</span>
        </div>

        {/* Card 5 */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex flex-col items-start relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none"><Eye className="w-16 h-16" /></div>
           <div className="w-8 h-8 rounded-full border border-teal-500/20 bg-teal-500/10 flex items-center justify-center mb-6 z-10">
             <Eye className="w-4 h-4 text-teal-500" />
           </div>
           <span className="text-white/50 text-xs font-medium mb-1 z-10">Views</span>
           <span className="text-2xl font-bold mb-2 z-10">4.7M</span>
           <span className="text-[#ccff00] text-xs font-semibold flex items-center gap-1 z-10"><ArrowUp className="w-3 h-3"/> 9.4%</span>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="px-5 mt-10 mb-6 flex items-center justify-between">
        <h3 className="font-bold text-lg">Analytics Overview</h3>
        <span className="text-white/40 text-sm">Last 7 Days</span>
      </div>

      <div className="px-5">
         <div className="w-full bg-[#121212] border border-white/5 rounded-2xl p-4 pb-6">
            <div className="flex justify-center gap-6 mb-6">
              <span className="flex items-center gap-2 text-xs text-white/80 font-medium">
                <div className="w-3 h-1 bg-[#ccff00] rounded-full"></div> Views
              </span>
              <span className="flex items-center gap-2 text-xs text-white/80 font-medium">
                <div className="w-3 h-1 bg-orange-500 rounded-full"></div> Likes
              </span>
              <span className="flex items-center gap-2 text-xs text-white/80 font-medium">
                <div className="w-3 h-1 bg-blue-500 rounded-full"></div> Comments
              </span>
            </div>

            <div className="relative h-48 w-full border-b border-l border-white/10 pb-2 pl-2">
               {/* Y Axis */}
               <div className="absolute left-[-24px] top-0 bottom-6 flex flex-col justify-between text-[10px] text-white/40 font-mono">
                  <span>1.2M</span>
                  <span>900K</span>
                  <span>600K</span>
                  <span>300K</span>
                  <span>0</span>
               </div>
               
               {/* X Axis */}
               <div className="absolute left-2 right-0 bottom-[-24px] flex justify-between text-[10px] text-white/40 font-mono">
                  <span>May 12</span>
                  <span>May 14</span>
                  <span>May 16</span>
                  <span>May 18</span>
               </div>

               {/* Grid lines */}
               <div className="absolute left-2 right-0 top-[25%] border-t border-white/5"></div>
               <div className="absolute left-2 right-0 top-[50%] border-t border-white/5"></div>
               <div className="absolute left-2 right-0 top-[75%] border-t border-white/5"></div>

               {/* Fake Chart Lines */}
               <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  {/* Views */}
                  <polyline fill="none" stroke="#ccff00" strokeWidth="2"
                            points="0,60 15,40 30,45 50,20 70,35 85,30 100,28" />
                  <circle cx="0" cy="60" r="2" fill="#ccff00" />
                  <circle cx="15" cy="40" r="2" fill="#ccff00" />
                  <circle cx="30" cy="45" r="2" fill="#ccff00" />
                  <circle cx="50" cy="20" r="2" fill="#ccff00" />
                  <circle cx="70" cy="35" r="2" fill="#ccff00" />
                  <circle cx="85" cy="30" r="2" fill="#ccff00" />
                  <circle cx="100" cy="28" r="2" fill="#ccff00" />

                  {/* Likes */}
                  <polyline fill="none" stroke="#f97316" strokeWidth="2"
                            points="0,85 15,80 30,78 50,60 70,70 85,62 100,65" />
                  <circle cx="0" cy="85" r="2" fill="#f97316" />
                  <circle cx="15" cy="80" r="2" fill="#f97316" />
                  <circle cx="30" cy="78" r="2" fill="#f97316" />
                  <circle cx="50" cy="60" r="2" fill="#f97316" />
                  <circle cx="70" cy="70" r="2" fill="#f97316" />
                  <circle cx="85" cy="62" r="2" fill="#f97316" />
                  <circle cx="100" cy="65" r="2" fill="#f97316" />

                  {/* Comments */}
                  <polyline fill="none" stroke="#3b82f6" strokeWidth="2"
                            points="0,95 15,90 30,90 50,85 70,90 85,85 100,85" />
                  <circle cx="0" cy="95" r="2" fill="#3b82f6" />
                  <circle cx="15" cy="90" r="2" fill="#3b82f6" />
                  <circle cx="30" cy="90" r="2" fill="#3b82f6" />
                  <circle cx="50" cy="85" r="2" fill="#3b82f6" />
                  <circle cx="70" cy="90" r="2" fill="#3b82f6" />
                  <circle cx="85" cy="85" r="2" fill="#3b82f6" />
                  <circle cx="100" cy="85" r="2" fill="#3b82f6" />
               </svg>
            </div>
         </div>
      </div>

      {/* Top Performing Posts */}
      <div className="px-5 mt-10 mb-6 flex items-center justify-between">
        <h3 className="font-bold text-lg">Top Performing Posts</h3>
        <span className="text-[#ccff00] text-sm font-semibold cursor-pointer" onClick={() => setActiveTab('manage')}>View all</span>
      </div>

      <div className="px-5 space-y-4 mb-8">
        {posts.slice(0, 5).map((p) => (
          <div key={p.id || p.title} className="flex gap-4 items-center">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#121212] relative">
              {p.imageUrls?.[0] || p.imageUrl ? (
                <img src={p.imageUrls?.[0] || p.imageUrl} alt={p.title} className="object-cover w-full h-full opacity-80" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                   <FileText className="w-6 h-6 opacity-50" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 py-1">
               <h4 className="font-bold text-white leading-tight mb-1 truncate">{p.title}</h4>
               <p className="text-white/40 text-[10px] mb-2 font-mono flex items-center gap-2 truncate">
                 {p.tags && p.tags.length > 0 && (
                   <span className="text-[#ccff00] uppercase font-bold">{p.tags.slice(0, 2).map((t: string) => t.replace(/^#/, '')).join(', ')}</span>
                 )}
                 {p.tags && p.tags.length > 0 && <span>•</span>}
                 {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : (p.date || 'Unknown')}
               </p>
               <div className="flex items-center gap-3 text-[11px] text-white/60 font-medium">
                 <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.viewsCount || 0}</span>
                 <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {p.reactionsCount || 0}</span>
                 <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {p.commentsCount || 0}</span>
               </div>
            </div>
          </div>
        ))}
        
        <button onClick={() => setActiveTab('manage')} className="w-full mt-4 py-4 rounded-xl border border-[#ccff00]/30 hover:bg-[#ccff00]/10 text-[#ccff00] font-semibold text-sm transition-colors cursor-pointer">
          View all posts
        </button>
      </div>
    </div>
  );
}
