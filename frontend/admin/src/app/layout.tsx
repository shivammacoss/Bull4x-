import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import ThemeInitScript from '@/components/ThemeInitScript';
import AppToaster from '@/components/AppToaster';

export const metadata: Metadata = {
  title: 'Bull4x Admin',
  description: 'Bull4x broker administration panel',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning style={{ ['--font-inter' as string]: "'Inter', system-ui, sans-serif", ['--font-jetbrains' as string]: "ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace" }}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-bg-page text-text-primary antialiased font-sans" suppressHydrationWarning>
        <ThemeInitScript />
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
