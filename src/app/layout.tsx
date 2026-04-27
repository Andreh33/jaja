import type { Metadata } from 'next';
import { Geist, Geist_Mono, Syne } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import CustomCursor from '@/components/effects/CustomCursor';
import ScrollProgress from '@/components/effects/ScrollProgress';
import WhatsAppFloat from '@/components/shared/WhatsAppFloat';
import SessionProvider from '@/components/providers/SessionProvider';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://latech.es'),
  title: {
    default: 'Latech · Servicios Tecnológicos Premium en Badajoz',
    template: '%s · Latech',
  },
  description:
    'Diseño web, tiendas online y agentes de IA con n8n. Entregamos en 24-48h. Sin permanencia. Badajoz.',
  keywords: ['diseño web Badajoz', 'tienda online', 'agente IA', 'n8n', 'desarrollo web Badajoz', 'Latech'],
  authors: [{ name: 'Latech' }],
  creator: 'Latech',
  openGraph: {
    title: 'Latech · Servicios Tecnológicos Premium',
    description: 'Webs, tiendas online y agentes IA premium. Entrega 24-48h. Badajoz.',
    url: 'https://latech.es',
    siteName: 'Latech',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latech · Servicios Tecnológicos Premium',
    description: 'Webs, tiendas online y agentes IA premium en 24-48h.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geist.variable} ${geistMono.variable} ${syne.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <SessionProvider>
          <ScrollProgress />
          <CustomCursor />
          {children}
          <WhatsAppFloat />
        </SessionProvider>
        <Toaster
          position="bottom-center"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: 'var(--bg-glass-strong)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(24px)',
            },
          }}
        />
      </body>
    </html>
  );
}
