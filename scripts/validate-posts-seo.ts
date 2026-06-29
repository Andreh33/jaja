import fs from 'fs';
import { posts as b1 } from './posts-data/seo-batch-1';
import { posts as b2 } from './posts-data/seo-batch-2';
import { posts as b3 } from './posts-data/seo-batch-3';
import { posts as b4 } from './posts-data/seo-batch-4';
import { posts as b5 } from './posts-data/seo-batch-5';
import { posts as b6 } from './posts-data/seo-batch-6';
import { posts as b7 } from './posts-data/seo-batch-7';
import { posts as b8 } from './posts-data/seo-batch-8';
import { posts as b9 } from './posts-data/seo-batch-9';

// Todos los batches juntos: así el check de duplicados detecta colisiones nuevo-vs-existente.
const all = [...b1, ...b2, ...b3, ...b4, ...b5, ...b6, ...b7, ...b8, ...b9];
const slugs = new Set<string>();
const errors: string[] = [];
const existing = [
  'web-actual-perdiendo-clientes',
  'tienda-online-vs-marketplace',
  'agentes-ia-n8n-pymes',
  'seo-local-badajoz',
  'stripe-empresas-guia-pagos-online',
  'elegir-empresa-diseno-web',
  'automatizaciones-n8n-pymes-12-procesos',
  'whatsapp-business-api-automatizacion',
];

for (const p of all) {
  if (slugs.has(p.slug)) errors.push(`slug duplicado: ${p.slug}`);
  slugs.add(p.slug);
  if (existing.includes(p.slug)) errors.push(`colisión con post existente: ${p.slug}`);
  if (!fs.existsSync(`public${p.cover}`)) errors.push(`cover no existe: ${p.cover}`);
  const words = p.content.split(/\s+/).length;
  if (words < 900) errors.push(`${p.slug} demasiado corto: ${words} palabras`);
  if (!p.title || !p.excerpt || !p.category) errors.push(`${p.slug}: campo vacío`);
}

const counts = all.map((p) => p.content.split(/\s+/).length);
console.log('Total posts:', all.length);
console.log('Categorías:', JSON.stringify([...new Set(all.map((p) => p.category))]));
console.log('Palabras (min-max):', Math.min(...counts), '-', Math.max(...counts));
console.log(errors.length ? 'ERRORES:\n' + errors.join('\n') : 'OK: sin errores');
process.exit(errors.length ? 1 : 0);
