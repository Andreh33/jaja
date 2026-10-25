/** HTTP verification of the complete localized release; never submits URLs. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { dictionaries, locales, pageKeys, pagePath, articlePath, equivalents, SITE } from '../src/lib/international';
const { values } = parseArgs({ options: { origin: { type: 'string', default: 'http://localhost:3012' }, output: { type: 'string', default: '.local/international-audit.json' } }, strict: true });
function attrs(tag: string): Record<string, string> {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1].toLowerCase(), m[2].replace(/&amp;/g, '&')]));
}
async function main() {
  const targets = locales.flatMap(locale => [
    ...pageKeys.map(key => ({ locale, path: pagePath(locale, key), languages: equivalents(key) })),
    ...dictionaries[locale].articles.map(a => ({ locale, path: articlePath(locale, a.id), languages: equivalents('article', a.id) })),
  ]);
  const rows: { path: string; status: number; lang?: string; failures: string[] }[] = [];
  for (let at = 0; at < targets.length; at += 5) await Promise.all(targets.slice(at, at + 5).map(async target => {
    const response = await fetch(new URL(target.path, values.origin), { redirect: 'manual', signal: AbortSignal.timeout(60000) });
    const html = await response.text();
    const links = [...html.matchAll(/<link\b[^>]+>/gi)].map(m => attrs(m[0]));
    const canonical = links.find(l => l.rel === 'canonical')?.href;
    const lang = /<html[^>]*\blang="([^"]+)"/i.exec(html)?.[1];
    const failures: string[] = [];
    if (response.status !== 200) failures.push(`HTTP ${response.status}`);
    if (canonical?.replace(/\/$/, '') !== `${SITE}${target.path}`.replace(/\/$/, '')) failures.push(`canonical ${canonical}`);
    if (lang !== target.locale) failures.push(`lang ${lang}`);
    const hreflang = Object.fromEntries(links.filter(l => l.rel === 'alternate' && l.hreflang).map(l => [l.hreflang, l.href]));
    for (const [locale, url] of Object.entries(target.languages)) {
      // Next serializes a bare site origin with a slash.
      if (hreflang[locale]?.replace(/\/$/, '') !== url.replace(/\/$/, '')) failures.push(`hreflang ${locale}`);
    }
    if (/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html)) failures.push('noindex');
    if (!/https:\/\/wa\.me\/34684739091\?text=/.test(html)) failures.push('missing contextual WhatsApp');
    if ((html.match(/<h1\b/g) ?? []).length !== 1) failures.push('h1 count');
    rows.push({ path: target.path, status: response.status, lang, failures });
  }));
  const sitemapResponse = await fetch(new URL('/sitemap.xml', values.origin));
  const sitemap = await sitemapResponse.text();
  const failures = rows.flatMap(r => r.failures.map(failure => ({ path: r.path, failure })));
  const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).href));
  for (const target of targets) if (!sitemapUrls.has(new URL(`${SITE}${target.path}`).href)) failures.push({ path: target.path, failure: 'missing sitemap URL' });
  for (const path of ['/xx', '/fr/blog/not-a-real-article', '/en/admin', '/fr/contact/unexpected']) {
    const response = await fetch(new URL(path, values.origin), { redirect: 'manual' });
    if (response.status !== 404) failures.push({ path, failure: `expected 404, got ${response.status}` });
  }
  mkdirSync('.local', { recursive: true });
  writeFileSync(values.output!, JSON.stringify({ checkedAt: new Date().toISOString(), origin: values.origin, count: rows.length, failures, rows }, null, 2));
  console.log(JSON.stringify({ count: rows.length, failures, output: values.output }));
  if (failures.length) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
