import { internationalSitemap, dictionaries, pageKeys, pagePath, articlePath, equivalents, SITE, INTERNATIONAL_UPDATE_DATE } from '@/lib/international';
export const dynamic = 'force-static';
const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export function GET() {
  const entries = [
    ...internationalSitemap(),
    ...pageKeys.map(key => ({ url: `${SITE}${pagePath('es', key)}`, alternates: { languages: equivalents(key) } })),
    ...dictionaries.es.articles.map(a => ({ url: `${SITE}${articlePath('es', a.id)}`, alternates: { languages: equivalents('article', a.id) } })),
  ];
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + entries.map(entry => `<url><loc>${escapeXml(entry.url)}</loc><lastmod>${INTERNATIONAL_UPDATE_DATE}</lastmod>${Object.entries(entry.alternates?.languages ?? {}).map(([locale, url]) => `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(String(url))}" />`).join('')}</url>`).join('') + '</urlset>';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
