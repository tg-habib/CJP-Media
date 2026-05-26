"use client";

import { animate, motion, useMotionTemplate, useMotionValue } from 'motion/react';
import { Flame, Github, Twitter, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/50 backdrop-blur-xl mt-auto z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none" />
      <div className="container mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
             <Link href="/" className="flex items-center gap-2 group relative w-fit">
               <div className="bg-primary/20 p-2 rounded-full">
                 <Flame className="w-5 h-5 text-primary" />
               </div>
               <span className="font-extrabold text-xl tracking-tight text-white transition-all duration-300">
                 CJP Media
               </span>
             </Link>
             <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
               Art That Survives. Roasts That Bite. The official independent media platform for the Cockroach Janta Party. We survive the apocalypse, and we survive the truth.
             </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-white tracking-wide uppercase text-sm">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home Feed</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white tracking-wide uppercase text-sm">Join the Horde</h4>
            <div className="flex space-x-4">
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Github" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Alerts" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <AlertTriangle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground/60">
          <p>© {new Date().getFullYear()} CJP Media. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of War</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
