import { renderBrandOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const alt = 'Proyectos · Latech';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderBrandOG({
    kicker: 'Once negocios que confían en Latech',
    title: 'Proyectos en producción.',
  });
}
