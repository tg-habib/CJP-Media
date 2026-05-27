import '../index.css';
import Providers from '../components/Providers';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { getProfileSettings } from './admin/actions';
import NextTopLoader from 'nextjs-toploader';

export const metadata = {
  title: 'CJP Media | Political Satire & Roasts',
  description: 'Art That Survives. Roasts That Bite.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getProfileSettings();

  return (
    <html lang="en" className={`dark`}>
      <body className="font-sans flex flex-col min-h-screen bg-[#050505] text-white selection:bg-primary/30 selection:text-white pb-20 sm:pb-0">
        <NextTopLoader
          color="#ccff00"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #ccff00,0 0 5px #ccff00"
        />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-black focus:font-bold focus:rounded-b-xl">
          Skip to main content
        </a>
        <Header settings={settings} />
        <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none relative">
          {children}
        </main>
        <Footer settings={settings} />
        <BottomNav />
        <Providers>{null}</Providers>
      </body>
    </html>
  );
}
