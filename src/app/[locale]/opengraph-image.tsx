import { notFound } from 'next/navigation';
import { dictionaries, isLocale } from '@/lib/international';
import { brandedOgImage, OG_SIZE } from '@/lib/og-image';
export const alt = 'Latech';
export const size = OG_SIZE;
export const contentType = 'image/png';
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || locale === 'es') notFound();
  const d = dictionaries[locale];
  return brandedOgImage({ title: d.home.heading, subtitle: d.home.description, badge: 'Latech' });
}
