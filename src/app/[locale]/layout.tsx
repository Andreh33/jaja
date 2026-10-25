import type { Metadata } from 'next';
import { Geist, Geist_Mono, Syne } from 'next/font/google';
import { notFound } from 'next/navigation';
import PublicAnalytics from '@/components/shared/PublicAnalytics';
import ContactClickTracker from '@/components/shared/ContactClickTracker';
import { dictionaries, isLocale, locales, SITE, htmlLanguage } from '@/lib/international';
import '../globals.css';
import '../blue-experience.css';
import './international.css';

const geist = Geist({ variable: '--font-geist', subsets: ['latin'] });
const mono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const syne = Syne({ variable: '--font-syne', subsets: ['latin'], weight: ['500', '600', '700', '800'] });
export const dynamicParams = false;
export function generateStaticParams() { return locales.filter(l => l !== 'es').map(locale => ({ locale })); }
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  verification: { google: 'WDbrVKr2CeTxz4pUSWpoNn604_T1z6nXKSJlcJkZtlc' },
  icons: { icon: '/icon.png', apple: '/apple-icon.png' },
};
export default async function InternationalLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'es') notFound();
  return <html lang={htmlLanguage(locale)} className={`${geist.variable} ${mono.variable} ${syne.variable}`}><body className="international-site">
    <a href="#main-content" className="skip-link">{String(dictionaries[locale].ui.skip)}</a>
    {children}<ContactClickTracker /><PublicAnalytics />
  </body></html>;
}
