export function sitemapUrls(xml: string, origin: string): string[] {
  if (!/<urlset[\s>]/.test(xml) || /<!DOCTYPE|<!ENTITY|<sitemapindex[\s>]/i.test(xml)) throw new Error('UNSUPPORTED_SITEMAP');
  const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(match => {
    const url = new URL(match[1].replace(/&amp;/g, '&'));
    if (url.origin !== origin || url.username || url.password || url.search || url.hash || /^\/(?:admin|dashboard|api|login|registro|recuperar|mando|cursos)(?:\/|$)/.test(url.pathname)) throw new Error('UNSAFE_SITEMAP_URL');
    return url.href;
  });
  const unique = [...new Set(urls)];
  if (!unique.length || unique.length > 10_000) throw new Error('INVALID_SITEMAP_SIZE');
  return unique;
}
