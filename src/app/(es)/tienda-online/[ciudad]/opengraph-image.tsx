import { getCity } from '@/content/local';
import { brandedOgImage, OG_SIZE } from '@/lib/og-image';

export const alt = 'Tienda online profesional para tu ciudad · Latech';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ ciudad: string }> }) {
  const { ciudad } = await params;
  const city = getCity(ciudad);
  return brandedOgImage({
    title: `Tienda online en ${city?.name ?? 'España'}`,
    subtitle: 'E-commerce con Stripe y Bizum, listo para vender · entrega en 24-48h',
    badge: city ? `${city.name} · ${city.region}` : 'Toda España',
  });
}
