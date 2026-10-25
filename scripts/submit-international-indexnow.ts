/** Explicit release submission; one receipt prevents accidental repeated sends. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { dictionaries, locales, pageKeys, pagePath, articlePath, SITE } from '../src/lib/international';
const { values } = parseArgs({ options: { submit: { type: 'boolean', default: false }, audit: { type: 'string', default: '.local/international-production-audit.json' }, receipt: { type: 'string', default: '.local/international-indexnow-receipt.json' } }, strict: true });
async function main() {
  const urls = [...new Set(locales.flatMap(locale => [...pageKeys.map(key => `${SITE}${pagePath(locale, key)}`), ...dictionaries[locale].articles.map(a => `${SITE}${articlePath(locale, a.id)}`)]))];
  if (!values.submit) { console.log(JSON.stringify({ status: 'preview', count: urls.length, urls })); return; }
  if (existsSync(values.receipt!)) throw new Error('RECEIPT_EXISTS_DO_NOT_RESUBMIT');
  const audit = JSON.parse(readFileSync(values.audit!, 'utf8'));
  if (audit.origin !== SITE || audit.count !== urls.length || audit.failures.length) throw new Error('PRODUCTION_AUDIT_REQUIRED');
  const key = readFileSync('public/bd701979484e06a606e375952baea796.txt', 'utf8').trim();
  const keyLocation = `${SITE}/${key}.txt`;
  const proof = await fetch(keyLocation);
  if (proof.status !== 200 || proof.url !== keyLocation || (await proof.text()).trim() !== key) throw new Error('OWNERSHIP_PROOF_FAILED');
  const receipt = { submittedAt: new Date().toISOString(), endpoint: 'https://api.indexnow.org/indexnow', count: urls.length, urls, status: 'attempting' as string | number, response: '', meaning: 'Receipt only; not proof of indexing. Shared with participating IndexNow search engines.' };
  writeFileSync(values.receipt!, JSON.stringify(receipt, null, 2));
  const response = await fetch(receipt.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation, urlList: urls }), signal: AbortSignal.timeout(45000) });
  receipt.status = response.status; receipt.response = await response.text();
  writeFileSync(values.receipt!, JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify({ count: urls.length, status: response.status, receipt: values.receipt }));
  if (![200, 202].includes(response.status)) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
