import type { Metadata } from 'next';
import { Geist, Geist_Mono, Syne } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Toaster } from 'sonner';
import CustomCursor from '@/components/effects/CustomCursor';
import ScrollProgress from '@/components/effects/ScrollProgress';
import WhatsAppFloat from '@/components/shared/WhatsAppFloat';
import SessionProvider from '@/components/providers/SessionProvider';
import JsonLd from '@/components/seo/JsonLd';
import { ORGANIZATION_JSONLD } from '@/lib/seo';

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
  metadataBase: new URL('https://serviciosonlineweb.com'),
  title: {
    // ≤60 caracteres para que no se corte en la SERP.
    default: 'Latech · Diseño web, tiendas online y agentes IA en España',
    template: '%s · Latech',
  },
  description:
    'Diseño web profesional, tiendas online y agentes de IA con n8n para empresas de toda España. Entrega en 24-48h, reuniones por videollamada, sin permanencia.',
  keywords: [
    'diseño web',
    'diseño web profesional',
    'tienda online',
    'tienda online profesional',
    'agencia desarrollo web',
    'agente IA',
    'recepcionista virtual',
    'automatización n8n',
    'e-commerce España',
    'Latech',
  ],
  authors: [{ name: 'Latech' }],
  creator: 'Latech',
  openGraph: {
    title: 'Latech · Diseño web, tiendas online y agentes IA',
    description:
      'Webs, tiendas online y agentes de IA para empresas de toda España. Entrega 24-48h. Sin permanencia.',
    url: 'https://serviciosonlineweb.com',
    siteName: 'Latech',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latech · Diseño web, tiendas online y agentes IA',
    description: 'Webs, tiendas online y agentes de IA para toda España en 24-48h.',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'WDbrVKr2CeTxz4pUSWpoNn604_T1z6nXKSJlcJkZtlc',
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
        <JsonLd data={ORGANIZATION_JSONLD} />
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
        <Analytics />
      </body>
    </html>
  );
}
