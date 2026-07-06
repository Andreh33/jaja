import { getCity } from '@/content/local';
import { brandedOgImage, OG_SIZE } from '@/lib/og-image';

export const alt = 'Diseño web profesional para tu ciudad · Latech';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ ciudad: string }> }) {
  const { ciudad } = await params;
  const city = getCity(ciudad);
  return brandedOgImage({
    title: `Diseño web en ${city?.name ?? 'España'}`,
    subtitle: 'Webs rápidas y optimizadas para Google · entrega en 24-48h · sin permanencia',
    badge: city ? `${city.name} · ${city.region}` : 'Toda España',
  });
}
