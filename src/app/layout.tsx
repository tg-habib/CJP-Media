import '../index.css';
import Providers from '../components/Providers';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

export const metadata = {
  title: 'CJP Media | Political Satire & Roasts',
  description: 'Art That Survives. Roasts That Bite.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark`}>
      <body className="font-sans flex flex-col min-h-screen bg-black text-white selection:bg-primary/30 selection:text-white pb-20 sm:pb-0">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-black focus:font-bold focus:rounded-b-xl">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
          {children}
        </main>
        <BottomNav />
        <Providers>{null}</Providers>
      </body>
    </html>
  );
}
