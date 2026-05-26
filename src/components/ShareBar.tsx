"use client";

import { useState } from 'react';
import { Share2, Check, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function ShareBar({ url, title, text }: { url: string, title?: string, text?: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || 'CJP Media');
  const encodedText = encodeURIComponent(text || 'Check out this post on CJP Media');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const buttonClass = "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-md hover:scale-105";

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className={buttonClass} aria-label="Share on Twitter/X">
        <Twitter className="w-5 h-5 fill-current" />
      </a>
      
      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className={buttonClass} aria-label="Share on Facebook">
        <Facebook className="w-5 h-5 fill-current" />
      </a>
      
      <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className={buttonClass} aria-label="Share on LinkedIn">
        <Linkedin className="w-5 h-5 fill-current" />
      </a>

      {/* WhatsApp SVG */}
      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className={buttonClass} aria-label="Share on WhatsApp">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
      </a>

      <button onClick={handleCopyLink} className={buttonClass} aria-label="Copy Link">
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="w-5 h-5 text-primary" />
            </motion.div>
          ) : (
            <motion.div key="link" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <LinkIcon className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
