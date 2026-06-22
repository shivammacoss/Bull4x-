import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { AuthProvider } from '@/components/providers/AuthProvider';
import NotificationListener from '@/components/NotificationListener';
import TopLoader from '@/components/TopLoader';

export const metadata: Metadata = {
  title: {
    default: 'Bull4x — Regulated Forex & CFD Brokerage',
    template: '%s · Bull4x',
  },
  description:
    'Trade 60+ forex pairs, metals, indices and crypto CFDs on a regulated brokerage. Tight spreads from 0.0 pips, sub-30ms execution, same-day withdrawals in USD, EUR, GBP, or USDT.',
  keywords: [
    'forex broker',
    'forex trading',
    'CFD broker',
    'MT4',
    'MT5',
    'ECN account',
    'tight spreads',
    'regulated forex broker',
    'crypto CFDs',
    'Bull4x',
  ],
  openGraph: {
    title: 'Bull4x — Regulated Forex & CFD Brokerage',
    description:
      'Tight spreads from 0.0 pips. Sub-30ms execution. Same-day withdrawals across 60+ forex, metal, index, and crypto CFD markets.',
    siteName: 'Bull4x',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bull4x — Regulated Forex & CFD Brokerage',
    description:
      'Trade 60+ markets with tight spreads, sub-30ms execution, and same-day withdrawals.',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var L='trustedge-ui',N='bull4x-ui';var o=localStorage.getItem(L),n=localStorage.getItem(N);if(o&&!n){localStorage.setItem(N,o);localStorage.removeItem(L);}var s=localStorage.getItem(N);var t='dark';if(s){var j=JSON.parse(s);t=(j&&j.state&&j.state.theme)||(j&&j.theme)||'dark';}var d=document.documentElement;d.setAttribute('data-theme',t);d.classList.add(t==='light'?'theme-light':'theme-dark');if(t==='light'){d.style.backgroundColor='#ffffff';d.style.color='#111827';}else{d.style.backgroundColor='#0a0a0a';d.style.color='#ffffff';}}catch(e){document.documentElement.setAttribute('data-theme','light');document.documentElement.style.backgroundColor='#ffffff';document.documentElement.style.color='#111827';}})();`,
          }}
        />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <ThemeProvider>
          <AuthProvider>
            <NotificationListener />
            {children}
            <Suspense fallback={null}>
              <MobileBottomNav />
            </Suspense>
            <Toaster
              position="top-center"
              containerClassName="bull4x-toaster"
              toastOptions={{
                duration: 1500,
                className: 'bull4x-hot-toast',
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-fg)',
                  border: '1px solid var(--toast-border)',
                  fontSize: '13px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                },
                success: {
                  duration: 1500,
                  className: 'bull4x-hot-toast',
                  iconTheme: { primary: '#2196f3', secondary: 'var(--toast-bg)' },
                },
                error: {
                  duration: 2500,
                  className: 'bull4x-hot-toast',
                  iconTheme: { primary: '#f87171', secondary: 'var(--toast-bg)' },
                },
                loading: { className: 'bull4x-hot-toast' },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
