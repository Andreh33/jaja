import { brandedOgImage, OG_SIZE } from '@/lib/og-image';

export const alt = 'Agente de IA · recepcionista virtual 24/7 · Latech';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return brandedOgImage({
    title: 'Tu recepcionista con inteligencia artificial',
    subtitle: 'Atención web y telefónica · Propuesta a medida para tu negocio',
    badge: 'Agente de IA',
  });
}
