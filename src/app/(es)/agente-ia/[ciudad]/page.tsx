import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LandingTemplate from '@/components/local/LandingTemplate';
import { landingsFor, getLanding } from '@/content/local';
import { SITE_URL } from '@/lib/seo';

const SERVICE = 'agente-ia' as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return landingsFor(SERVICE).map((l) => ({ ciudad: l.citySlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ ciudad: string }> }): Promise<Metadata> {
  const { ciudad } = await params;
  const l = getLanding(SERVICE, ciudad);
  if (!l) return { title: 'No encontrado' };
  const url = `${SITE_URL}/${SERVICE}/${ciudad}`;
  return {
    title: { absolute: l.title },
    description: l.description,
    alternates: { canonical: url },
    openGraph: { title: l.title, description: l.description, url, siteName: 'Latech', locale: 'es_ES', type: 'website' },
  };
}

export default async function Page({ params }: { params: Promise<{ ciudad: string }> }) {
  const { ciudad } = await params;
  const l = getLanding(SERVICE, ciudad);
  if (!l) notFound();
  return <LandingTemplate landing={l} />;
}
