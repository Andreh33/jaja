import { brandedOgImage, OG_SIZE } from '@/lib/og-image';

export const alt = 'Diseño web profesional para empresas · Latech';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return brandedOgImage({
    title: 'Diseño web profesional para empresas',
    subtitle: 'SEO técnico, mobile-first y entrega en 24-48h · 600€ + 60€/mes · sin permanencia',
    badge: 'Plan Web',
  });
}
