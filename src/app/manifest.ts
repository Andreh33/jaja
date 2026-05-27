import type { MetadataRoute } from 'next';

/**
 * Web App Manifest (Next 16 nativo). Hace la web instalable como app.
 * Iconos generados con `npx tsx scripts/gen-pwa-icons.ts`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Latech · Servicios Tecnológicos Premium',
    short_name: 'Latech',
    description: 'Diseño web, tiendas online y agentes de IA con n8n. Entrega en 24-48h. Sin permanencia.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#07050E',
    theme_color: '#07050E',
    lang: 'es',
    dir: 'ltr',
    orientation: 'portrait-primary',
    categories: ['business', 'productivity', 'technology'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
