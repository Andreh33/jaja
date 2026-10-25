import { notFound } from 'next/navigation';
import { dictionaries, isLocale, locales, pageKeys, pagePath, resolvePage, internationalMetadata } from '@/lib/international';
import InternationalPage from '@/components/international/InternationalPage';

type Props = { params: Promise<{ locale: string; path?: string[] }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return locales.filter(l => l !== 'es').flatMap(locale => [
    ...pageKeys.map(key => ({ locale, path: pagePath(locale, key).split('/').slice(2) })),
    ...dictionaries[locale].articles.map(a => ({ locale, path: ['blog', a.slug] })),
  ]);
}
export async function generateMetadata({ params }: Props) {
  const { locale, path } = await params;
  const page = resolvePage(locale, path);
  if (!isLocale(locale) || !page) notFound();
  return internationalMetadata(locale, page);
}
export default async function Page({ params }: Props) {
  const { locale, path } = await params;
  const page = resolvePage(locale, path);
  if (!isLocale(locale) || locale === 'es' || !page) notFound();
  return <InternationalPage locale={locale} page={page} />;
}
