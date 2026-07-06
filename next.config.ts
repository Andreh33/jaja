import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
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
