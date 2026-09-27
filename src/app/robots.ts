import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/api', '/mando'] },
    ],
    sitemap: 'https://serviciosonlineweb.com/sitemap.xml',
  };
}
