import { notFound } from 'next/navigation';
import { brandedOgImage, OG_SIZE } from '@/lib/og-image';
import { getExperiment } from '../_lib/experiments';
export const alt = 'Un experimento de Latech Lab';
export const size = OG_SIZE;
export const contentType = 'image/png';
export default async function Image({ params }: { params: Promise<{ experimento: string }> }) {
  const experiment = getExperiment((await params).experimento);
  if (!experiment) notFound();
  return brandedOgImage({ title: experiment.title, subtitle: experiment.short, badge: 'Latech Lab' });
}
