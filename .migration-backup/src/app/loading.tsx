'use client';

import { motion } from 'motion/react';

export default function Loading() {
  return (
    <div className="absolute inset-x-0 top-0 bottom-0 z-[100] flex flex-col items-center justify-center bg-[#050505]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8"
      >
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute h-24 w-24 rounded-full border border-white/5"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute h-16 w-16 rounded-full border border-[#ccff00]/10"
            animate={{ scale: [1, 0.8, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="h-8 w-8 rounded-full bg-[#ccff00]"
            animate={{
              scale: [1, 0.6, 1],
              opacity: [0.8, 0.3, 0.8]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "blur(10px)" }}
          />
          <motion.div
            className="absolute h-3 w-3 rounded-full bg-[#ccff00]"
            animate={{
              scale: [1, 0.5, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <div className="flex gap-1.5 justify-center mt-2">
          {["L", "O", "A", "D", "I", "N", "G"].map((letter, i) => (
            <motion.span
              key={i}
              className="text-[10px] font-mono font-medium tracking-[0.2em] text-[#ccff00]/80"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
