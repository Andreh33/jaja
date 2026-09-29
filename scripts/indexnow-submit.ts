/** Read the live sitemap; submit only with --submit. The ownership key is public. */
import { parseArgs } from 'node:util';
import { sitemapUrls } from './lib/indexnow-sitemap';
const HOST = 'serviciosonlineweb.com';
const KEY = 'bd701979484e06a606e375952baea796';
const base = `https://${HOST}`;
async function main() {
  const { values } = parseArgs({ options: { submit: { type: 'boolean', default: false } }, strict: true, allowPositionals: false });
  const response = await fetch(`${base}/sitemap.xml`, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok || new URL(response.url).origin !== base) throw new Error('SITEMAP_UNAVAILABLE');
  const urlList = sitemapUrls(await response.text(), base);
  console.log(JSON.stringify({ status: values.submit ? 'submitting' : 'preview-no-submission', urls: urlList.length }));
  if (!values.submit) return;
  const keyLocation = `${base}/${KEY}.txt`;
  const proof = await fetch(keyLocation, { signal: AbortSignal.timeout(20_000) });
  if (!proof.ok || proof.url !== keyLocation || (await proof.text()).trim() !== KEY) throw new Error('OWNERSHIP_PROOF_UNAVAILABLE');
  const result = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation, urlList }), signal: AbortSignal.timeout(30_000),
  });
  if (![200, 202].includes(result.status)) throw new Error(`INDEXNOW_HTTP_${result.status}`);
  console.log(JSON.stringify({ status: 'accepted-not-guaranteed-indexed', http: result.status, urls: urlList.length }));
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'INDEXNOW_FAILED'); process.exitCode = 1; });
