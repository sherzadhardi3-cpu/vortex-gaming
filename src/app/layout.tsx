import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SupportWidget } from '@/components/support/SupportWidget';

export const metadata: Metadata = {
  metadataBase: new URL('https://vortexgaming.gg'),
  title: {
    default: 'VORTEX GAMING — Premier Digital Game Store & Instant Key Vault',
    template: '%s | VORTEX GAMING',
  },
  description:
    'VORTEX GAMING is the premier digital entertainment marketplace providing authentic, instant-delivery activation keys for Steam, PlayStation, Xbox, and Epic Games with 256-bit encrypted checkout.',
  keywords: [
    'VORTEX GAMING',
    'game keys',
    'Steam keys',
    'PlayStation codes',
    'Xbox Game Pass',
    'digital games',
    'instant delivery',
    'crypto key vault',
    'FIB',
    'FastPay',
    'Qi Card',
  ],
  authors: [{ name: 'VORTEX GAMING Operations' }],
  creator: 'VORTEX GAMING',
  publisher: 'VORTEX GAMING',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'VORTEX GAMING — Premier Digital Game Store & Instant Key Vault',
    description:
      'Authentic game keys with automated digital delivery upon payment clearance and dedicated gamer support.',
    url: 'https://vortexgaming.gg',
    siteName: 'VORTEX GAMING',
    images: [
      {
        url: '/vortex-logo.svg',
        width: 1200,
        height: 630,
        alt: 'VORTEX GAMING Digital Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VORTEX GAMING — Premier Digital Game Store & Instant Key Vault',
    description:
      'Authentic digital game keys with automated delivery upon payment clearance and dedicated gamer support.',
    images: ['/vortex-logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] flex flex-col font-sans antialiased selection:bg-[#00d4ff]/30 selection:text-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <SupportWidget />
      </body>
    </html>
  );
}
