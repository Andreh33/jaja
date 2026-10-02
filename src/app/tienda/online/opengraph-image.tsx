import { brandedOgImage, OG_SIZE } from '@/lib/og-image';

export const alt = 'Crear tienda online profesional · Latech';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return brandedOgImage({
    title: 'Tu tienda online lista para vender',
    subtitle: 'Diseño a medida · Trato directo · Hablemos de tu proyecto por WhatsApp',
    badge: 'Plan Tienda Online',
  });
}
