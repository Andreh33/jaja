/**
 * Helper para invocar el cron de limpieza GDPR localmente.
 *
 * Lee CRON_SECRET de .env.local (si está) y hace GET con bearer al
 * endpoint local. Imprime la respuesta JSON.
 *
 * Uso:
 *   node scripts/test-cleanup-cron.mjs
 *   node scripts/test-cleanup-cron.mjs --url=http://localhost:3000  # cambiar host
 */

import { readFileSync } from 'node:fs';

let envFile = '';
try {
  envFile = readFileSync('.env.local', 'utf8');
} catch {
  console.error('No se pudo leer .env.local. Asegúrate de tenerlo en la raíz del repo.');
  process.exit(1);
}

const match = envFile.match(/^CRON_SECRET="?([^"\n]+)"?/m);
const secret = match?.[1];
if (!secret) {
  console.error('CRON_SECRET no está en .env.local. Genera uno con:');
  console.error('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  console.error('Y añade en .env.local: CRON_SECRET=<el-valor>');
  process.exit(1);
}

const urlArg = process.argv.find((a) => a.startsWith('--url='));
const baseUrl = urlArg ? urlArg.slice('--url='.length) : 'http://localhost:3000';
const fullUrl = `${baseUrl}/api/cron/cleanup-applications`;

console.log(`GET ${fullUrl}`);
console.log(`Authorization: Bearer ${secret.slice(0, 8)}...`);

try {
  const res = await fetch(fullUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secret}` },
  });
  const text = await res.text();
  console.log(`\nHTTP ${res.status}`);
  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log(text);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}

process.exit(0);
