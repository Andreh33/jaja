import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  experimental: { globalNotFound: true },
  // Build QA without replacing the assets of an already running local server.
  ...(process.env.LATECH_ISOLATED_QA === '1' ? { distDir: '.next-qa', experimental: { globalNotFound: true, cpus: 1 } } : {}),
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/tienda/calculadora', destination: '/contacto#proyecto', permanent: true },
      { source: '/prepara-tu-proyecto', destination: '/briefing', permanent: true },
      { source: '/blog/crear-web-nueva-empresa-espana', destination: '/blog/crear-una-web-para-una-nueva-empresa-en-espana', permanent: true },
      // www → apex con 308 permanente (el redirect por defecto de Vercel
      // para el dominio secundario es 307 y no consolida señales SEO).
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.serviciosonlineweb.com' }],
        destination: 'https://serviciosonlineweb.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
