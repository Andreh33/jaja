import { brandedOgImage, OG_SIZE } from '@/lib/og-image';
export const alt = 'Latech Lab: juegos y experimentos web';
export const size = OG_SIZE;
export const contentType = 'image/png';
export default function Image() { return brandedOgImage({ title: 'Latech Lab', subtitle: 'Juega. Crea. Explora.', badge: 'Tu imaginación, nuestro límite.' }); }
