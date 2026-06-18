import { Link, useLocation } from 'wouter';


import { Flame, Instagram, Twitter, Youtube, MessageCircle, Send, Compass, Users, FileText, Shield, Mail, ArrowRight, ChevronDown, Heart } from 'lucide-react';
import { useState } from 'react';

const xIcon = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" />
  </svg>
);

export default function Footer({ settings }: { settings: any }) {
  const [pathname] = useLocation();
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Don't show on certain routes if preferred, or show everywhere
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/post/') || pathname?.startsWith('/dashboard') || pathname?.startsWith('/profile') || pathname?.startsWith('/messages') || pathname?.startsWith('/notifications')) return null;

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#050505] relative z-10 px-4 pt-12 pb-24 sm:pb-12 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Top Hero Section */}
        <div className="relative w-full rounded-[30px] p-6 sm:p-12 overflow-hidden bg-[#0c0c0c] border border-white/5">
          {settings?.footerUrl && (
            <div className="absolute top-0 right-0 w-3/4 sm:w-1/2 h-full opacity-60 mix-blend-lighten pointer-events-none fade-image">
              <img 
                src={settings.footerUrl} 
                alt="CJP Mascot" 
                className="w-full h-full object-cover object-right-top"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0c] to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] to-transparent z-10"></div>
            </div>
          )}

          <div className="relative z-20 flex flex-col items-start w-full sm:w-1/2">
            <div className="flex items-center gap-3 mb-6">
              {settings?.avatarUrl ? (
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-[#ccff00]/50 overflow-hidden">
                  <img src={settings.avatarUrl} alt="CJP Media Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="bg-[#ccff00] w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-black" strokeWidth={2.5} />
                </div>
              )}
              <span className="font-extrabold text-2xl text-white tracking-tight">
                CJP Media
              </span>
            </div>

            <p className="text-white/70 text-[14px] leading-relaxed font-medium mb-6 max-w-[280px] sm:max-w-md">
              The official media wing of the Cockroach Janta Party. We amplify the voices of the unemployed youth and stand together for a real change.
            </p>

            <p className="text-white font-bold mb-8">
              Voice of the <span className="text-[#ccff00]">Real Majority.</span>
            </p>

            <div className="flex items-center gap-3">
              <a href="#" aria-label="Follow us on Instagram" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#ccff00]/50 hover:text-[#ccff00] transition-colors text-white/70">
                 <Instagram className="w-4 h-4" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Follow us on X (Twitter)" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#ccff00]/50 hover:text-[#ccff00] transition-colors text-white/70">
                 {xIcon}
              </a>
              <a href="#" aria-label="Subscribe on YouTube" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#ccff00]/50 hover:text-[#ccff00] transition-colors text-white/70">
                 <Youtube className="w-4 h-4" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Join our Discord server" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#ccff00]/50 hover:text-[#ccff00] transition-colors text-white/70">
                 <MessageCircle className="w-4 h-4" aria-hidden="true" />
              </a>
              <a href="#" aria-label="Join us on Telegram" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-[#ccff00]/50 hover:text-[#ccff00] transition-colors text-white/70">
                 <Send className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Links Accordion Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
          
          <div className="flex flex-col border border-white/5 rounded-3xl bg-[#0c0c0c] overflow-hidden">
            <button onClick={() => toggleSection('explore')} className="w-full flex items-center justify-between p-5 text-left active:bg-white/5 transition-colors sm:pointer-events-none">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#ccff00]/30 flex items-center justify-center bg-[#ccff00]/5 shrink-0 text-[#ccff00]">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-[15px]">Explore</h4>
                  <p className="text-white/40 text-[12px] font-medium hidden sm:block">Trending, News & more</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-white/40 sm:hidden transition-transform ${openSection === 'explore' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`px-5 pb-5 sm:block ${openSection === 'explore' ? 'block' : 'hidden'} sm:pt-0`}>
              <p className="text-white/50 text-[13px] font-medium sm:hidden mb-4">Trending, News, Youth Voice & more</p>
              <div className="flex flex-col gap-3">
                <Link href="/category/Trending" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Trending Roasts</Link>
                <Link href="/category/News" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Unfiltered News</Link>
                <Link href="/category/Youth Voice" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Youth Voice</Link>
                <Link href="/feed" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Latest Posts</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col border border-white/5 rounded-3xl bg-[#0c0c0c] overflow-hidden">
            <button onClick={() => toggleSection('community')} className="w-full flex items-center justify-between p-5 text-left active:bg-white/5 transition-colors sm:pointer-events-none">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#ccff00]/30 flex items-center justify-center bg-[#ccff00]/5 shrink-0 text-[#ccff00]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-[15px]">Community</h4>
                  <p className="text-white/40 text-[12px] font-medium hidden sm:block">Support, Volunteer</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-white/40 sm:hidden transition-transform ${openSection === 'community' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`px-5 pb-5 sm:block ${openSection === 'community' ? 'block' : 'hidden'} sm:pt-0`}>
              <p className="text-white/50 text-[13px] font-medium sm:hidden mb-4">Join the Movement, Support, Volunteer</p>
              <div className="flex flex-col gap-3">
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Support the Cause</Link>
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Volunteer</Link>
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Discord Server</Link>
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Merch Shop</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col border border-white/5 rounded-3xl bg-[#0c0c0c] overflow-hidden">
            <button onClick={() => toggleSection('resources')} className="w-full flex items-center justify-between p-5 text-left active:bg-white/5 transition-colors sm:pointer-events-none">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#ccff00]/30 flex items-center justify-center bg-[#ccff00]/5 shrink-0 text-[#ccff00]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-[15px]">Resources</h4>
                  <p className="text-white/40 text-[12px] font-medium hidden sm:block">Newsroom, Media Kit</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-white/40 sm:hidden transition-transform ${openSection === 'resources' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`px-5 pb-5 sm:block ${openSection === 'resources' ? 'block' : 'hidden'} sm:pt-0`}>
              <p className="text-white/50 text-[13px] font-medium sm:hidden mb-4">Newsroom, Reports, Media Kit, FAQ</p>
              <div className="flex flex-col gap-3">
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Newsroom</Link>
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Reports</Link>
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Media Kit</Link>
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">FAQ</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col border border-white/5 rounded-3xl bg-[#0c0c0c] overflow-hidden">
            <button onClick={() => toggleSection('legal')} className="w-full flex items-center justify-between p-5 text-left active:bg-white/5 transition-colors sm:pointer-events-none">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#ccff00]/30 flex items-center justify-center bg-[#ccff00]/5 shrink-0 text-[#ccff00]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-[15px]">Legal</h4>
                  <p className="text-white/40 text-[12px] font-medium hidden sm:block">Terms, Privacy Policy</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-white/40 sm:hidden transition-transform ${openSection === 'legal' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`px-5 pb-5 sm:block ${openSection === 'legal' ? 'block' : 'hidden'} sm:pt-0`}>
              <p className="text-white/50 text-[13px] font-medium sm:hidden mb-4">Terms of Use, Privacy Policy, Disclaimer</p>
              <div className="flex flex-col gap-3">
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Terms of Use</Link>
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Disclaimer</Link>
                <Link href="#" className="text-white/60 hover:text-white text-[13px] font-semibold transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
          
        </div>

        {/* Subscribe Section */}
        <div className="w-full bg-[#0a0a0a] border border-[#ccff00]/10 rounded-[30px] p-6 sm:p-10 flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between relative overflow-hidden">
           <div className="absolute inset-0 bg-[#ccff00]/5 pointer-events-none"></div>
           <div className="flex items-start gap-4 z-10 w-full sm:w-auto">
             <div className="w-14 h-14 rounded-full border border-[#ccff00] bg-[#1a1a1a] flex items-center justify-center shrink-0 text-[#ccff00]">
               <Mail className="w-6 h-6" />
             </div>
             <div className="flex flex-col">
               <h3 className="text-white font-extrabold text-[22px] tracking-tight mb-1 text-[#ccff00]">Stay Unfiltered.</h3>
               <p className="text-white/70 text-[14px] font-medium">Get real stories, straight to your inbox.<br />No spam. Just the truth.</p>
             </div>
           </div>
           
           <div className="w-full sm:w-auto flex-1 max-w-md z-10 flex flex-col gap-3">
             <label htmlFor="footer-email" className="sr-only">Email address</label>
             <input id="footer-email" type="email" placeholder="Enter your email" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-5 h-14 text-white text-[15px] font-medium placeholder-white/30 outline-none focus:border-[#ccff00]/50 transition-colors" />
             <button className="w-full bg-[#ccff00] hover:bg-[#bbe600] text-black font-extrabold text-[15px] rounded-xl h-14 flex items-center justify-center gap-2 transition-colors">
               Subscribe
               <ArrowRight className="w-5 h-5" aria-hidden="true" />
             </button>
           </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-center pt-8 border-t border-white/5 text-center gap-6">
           {settings?.avatarUrl ? (
             <img src={settings.avatarUrl} alt="CJP Media Logo" className="w-[42px] h-[42px] rounded-full object-cover border border-[#ccff00]/50" />
           ) : (
             <Flame className="w-8 h-8 text-[#ccff00]" strokeWidth={2.5} />
           )}
           
           <p className="text-white/60 text-[15px] font-medium">
             Built for the unheard. By the youth. <span className="text-[#ccff00]">For the future.</span>
           </p>

           <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>
           
           <p className="text-white/40 text-[14px] font-medium">
             © {currentYear} CJP Media. All rights reserved.
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 w-full">
             <p className="text-white/50 text-[14px] font-medium flex items-center gap-1.5">
               Made with <Heart className="w-4 h-4 fill-[#ccff00] text-[#ccff00]" /> for Change.
             </p>
             <div className="hidden sm:block w-px h-4 bg-white/10"></div>
             <div className="flex items-center gap-6">
               <Link href="#" className="text-white/50 hover:text-white transition-colors text-[14px] font-medium">Contact Us</Link>
               <span className="text-white/20">•</span>
               <Link href="#" className="text-white/50 hover:text-white transition-colors text-[14px] font-medium">Sitemap</Link>
             </div>
           </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .fade-image {
          mask-image: radial-gradient(circle at 100% 50%, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at 100% 50%, black 20%, transparent 90%);
        }
      `}} />
    </footer>
  );
}
