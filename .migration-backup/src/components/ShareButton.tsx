"use client";

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function ShareButton({ url, title, text }: { url: string, title?: string, text?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: title || 'CJP Media',
      text: text || 'Check out this roast on CJP Media',
      url: url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full border transition-all duration-300 bg-white/5 border-white/10 text-white/90 hover:bg-white/15 hover:text-white hover:border-white/30 backdrop-blur-md shadow-lg"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </motion.div>
        ) : (
          <motion.div key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Share2 className="w-4 h-4 md:w-5 md:h-5" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="font-bold text-sm md:text-base">{copied ? 'Copied' : 'Share'}</span>
    </motion.button>
  );
}
