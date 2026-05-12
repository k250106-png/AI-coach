import type { Metadata } from 'next';
import { DM_Sans, Syne } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import SiteHeader from '@/components/SiteHeader';
import ChatbotWidget from '@/components/ChatbotWidget';
import SmoothLoader from '../components/theme/SmoothLoader';
import UiMotionEffects from '../components/theme/UiMotionEffects';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MIRA - AI Interview Coach for Pakistani Jobs',
  description: 'MIRA — AI interview coaching, recruiter tools, and mock role-based access.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${dmSans.variable} ${syne.variable} font-body antialiased`}>
        <Providers>
          <SmoothLoader />
          <UiMotionEffects />
          <div className="page-shell">
            <div className="page-orb page-orb-a" />
            <div className="page-orb page-orb-b" />
            <div className="page-orb page-orb-c" />

            <SiteHeader />

            <main className="app-main page-enter">{children}</main>
            <ChatbotWidget />
          </div>
        </Providers>
      </body>
    </html>
  );
}
