"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
      <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
      <Link href="/" className="px-4 py-2 bg-primary text-black rounded font-bold">
        Return Home
      </Link>
    </div>
  );
}
