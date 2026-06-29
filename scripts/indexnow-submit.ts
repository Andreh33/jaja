/**
 * Envía las URLs nuevas a IndexNow (Bing + Yandex).
 * Uso: npx tsx scripts/indexnow-submit.ts
 * La clave es pública (vive en /<KEY>.txt), no es un secreto.
 */
import { allLandings } from '../src/content/local';
import { posts as b6 } from './posts-data/seo-batch-6';
import { posts as b7 } from './posts-data/seo-batch-7';
import { posts as b8 } from './posts-data/seo-batch-8';
import { posts as b9 } from './posts-data/seo-batch-9';

const HOST = 'serviciosonlineweb.com';
const KEY = 'bd701979484e06a606e375952baea796';
const base = `https://${HOST}`;

const newPosts = [...b6, ...b7, ...b8, ...b9];

const urlList = [
  `${base}/cobertura`,
  ...allLandings().map((l) => `${base}/${l.service}/${l.citySlug}`),
  ...newPosts.map((p) => `${base}/blog/${p.slug}`),
];

async function main() {
  console.log(`📡 Enviando ${urlList.length} URLs a IndexNow...`);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${base}/${KEY}.txt`,
      urlList,
    }),
  });
  const text = await res.text();
  console.log(`Status: ${res.status} ${res.statusText}`);
  console.log(text ? `Respuesta: ${text}` : '(sin cuerpo)');
  // 200/202 = aceptado. 422 = alguna URL no válida. 403 = clave no verificada.
  if (res.status === 200 || res.status === 202) {
    console.log(`✅ IndexNow aceptó ${urlList.length} URLs.`);
  } else {
    console.log('⚠️  Revisa el estado (403 = clave aún no desplegada; reintenta tras el deploy).');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
