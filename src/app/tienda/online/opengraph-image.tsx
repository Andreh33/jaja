import { brandedOgImage, OG_SIZE } from '@/lib/og-image';

export const alt = 'Crear tienda online profesional · Latech';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return brandedOgImage({
    title: 'Tu tienda online lista para vender',
    subtitle: 'Stripe, Bizum, SEO de productos y analítica · 600€ + 80€/mes · entrega en 48h',
    badge: 'Plan Tienda Online',
  });
}
