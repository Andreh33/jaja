import { renderBrandOG, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const alt = 'Latech · Servicios Tecnológicos Premium';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderBrandOG({
    kicker: 'Servicios tecnológicos premium',
    title: 'Webs que convierten visitas en clientes.',
  });
}
