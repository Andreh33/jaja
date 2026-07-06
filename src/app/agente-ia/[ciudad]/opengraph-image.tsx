import { getCity } from '@/content/local';
import { brandedOgImage, OG_SIZE } from '@/lib/og-image';

export const alt = 'Agente de IA para negocios de tu ciudad · Latech';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ ciudad: string }> }) {
  const { ciudad } = await params;
  const city = getCity(ciudad);
  return brandedOgImage({
    title: `Agente de IA en ${city?.name ?? 'España'}`,
    subtitle: 'Atiende llamadas y WhatsApp 24/7, gestiona reservas y cobra por voz',
    badge: city ? `${city.name} · ${city.region}` : 'Toda España',
  });
}
