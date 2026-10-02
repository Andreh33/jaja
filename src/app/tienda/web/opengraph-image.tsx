import { brandedOgImage, OG_SIZE } from '@/lib/og-image';

export const alt = 'Diseño web profesional para empresas · Latech';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return brandedOgImage({
    title: 'Diseño web profesional para empresas',
    subtitle: 'Diseño a medida · Trato directo · Hablemos de tu proyecto por WhatsApp',
    badge: 'Plan Web',
  });
}
