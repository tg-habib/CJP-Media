import { Link } from "wouter";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-black text-[#ccff00] mb-4">404</h1>
        <p className="text-white/60 text-xl mb-8">Page not found</p>
        <Link href="/" className="px-6 py-3 bg-[#ccff00] text-black font-bold rounded-full hover:bg-[#bbe600] transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}
