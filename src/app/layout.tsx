import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: {
    default: 'Artisan Marketplace — Find Trusted Local Artisans',
    template: '%s | Artisan Marketplace',
  },
  description: 'Connect with skilled local artisans for repairs, installations, and home services. Verified professionals, easy booking, peace of mind.',
  keywords: ['artisan', 'repair', 'home service', 'plumber', 'electrician', 'carpenter', 'booking', 'marketplace'],
  openGraph: {
    title: 'Artisan Marketplace',
    description: 'Find trusted artisans near you for all your repair and home service needs.',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6C63FF" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main id="main-content" className="page-layout">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
