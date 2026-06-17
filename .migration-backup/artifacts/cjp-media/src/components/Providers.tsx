import React from 'react';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster theme="dark" position="bottom-center" toastOptions={{ className: 'bg-black/80 backdrop-blur-xl border border-white/10 text-white font-medium rounded-2xl shadow-2xl mb-24 sm:mb-0' }} />
      {children}
    </>
  );
}
