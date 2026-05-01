/**
 * Seed idempotente de Products + Prices para la calculadora-wizard.
 *
 * AISLAMIENTO ESTRICTO:
 *   - Todo Product creado lleva metadata.source = 'calculator_v1' y metadata.catalog_id único.
 *   - Cualquier Product/Price sin esa metadata se IGNORA por completo.
 *   - Los Stripe Links existentes (web/tienda viejos) no se tocan.
 *
 * Uso:
 *   npm run stripe:seed -- --dry-run    (recomendado primera vez)
 *   npm run stripe:seed                 (ejecuta cambios en Stripe)
 *
 * Output:
 *   - Logs por cada item del catálogo: CREATE / REUSE / DRY-RUN.
 *   - src/config/stripe-prices.ts (auto-generado).
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { writeFileSync } from 'fs';
import { join } from 'path';
import Stripe from 'stripe';
import { CATALOG, type CatalogItem } from '../src/config/catalog';

const SOURCE_TAG = 'calculator_v1';
const DRY = process.argv.includes('--dry-run');

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('ERROR: STRIPE_SECRET_KEY no definida. Aborto.');
  process.exit(1);
}

const stripe = new Stripe(key, {
  apiVersion: '2026-04-22.dahlia',
  typescript: true,
});

type Resolved = {
  catalogId: string;
  productId: string;
  priceId: string;
  action: 'CREATED' | 'REUSED' | 'DRY-RUN';
};

async function findExistingProduct(catalogId: string): Promise<Stripe.Product | null> {
  const query = `metadata['source']:'${SOURCE_TAG}' AND metadata['catalog_id']:'${catalogId}'`;
  try {
    const res = await stripe.products.search({ query, limit: 2 });
    if (res.data.length > 1) {
      console.warn(`  ⚠️  Encontrados ${res.data.length} products con catalog_id=${catalogId}. Uso el primero (${res.data[0].id}).`);
    }
    return res.data[0] || null;
  } catch (err) {
    // Si search no está disponible (cuenta nueva sin reindex), fallback a list filtrado.
    console.warn(`  search() falló (${(err as Error).message}). Fallback a list().`);
    const list = await stripe.products.list({ limit: 100, active: true });
    return (
      list.data.find(
        (p) => p.metadata?.source === SOURCE_TAG && p.metadata?.catalog_id === catalogId,
      ) || null
    );
  }
}

async function findMatchingPrice(productId: string, item: CatalogItem): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  return (
    prices.data.find((p) => {
      if (p.unit_amount !== item.amount) return false;
      if (p.currency !== item.currency) return false;
      if (item.type === 'recurring') {
        return p.type === 'recurring' && p.recurring?.interval === item.interval;
      }
      return p.type === 'one_time';
    }) || null
  );
}

async function archiveStalePrices(productId: string, keepPriceId: string): Promise<number> {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  let archived = 0;
  for (const p of prices.data) {
    if (p.id === keepPriceId) continue;
    if (DRY) {
      console.log(`    [dry-run] would archive stale price ${p.id} (amount=${p.unit_amount})`);
    } else {
      await stripe.prices.update(p.id, { active: false });
      console.log(`    archived stale price ${p.id} (amount=${p.unit_amount})`);
    }
    archived++;
  }
  return archived;
}

async function ensureItem(item: CatalogItem): Promise<Resolved> {
  console.log(`\n[${item.id}] ${item.name}  (${item.type}${item.interval ? ` ${item.interval}` : ''}, ${item.amount}c ${item.currency})`);

  // 1) Product
  const existingProduct = await findExistingProduct(item.id);
  let product: Stripe.Product;
  let productAction: 'created' | 'reused' = 'reused';

  if (existingProduct) {
    product = existingProduct;
    console.log(`  product: REUSE  ${product.id}`);
    // Si nombre/descripción cambiaron, actualizo (no destructivo).
    if (product.name !== item.name || product.description !== item.description) {
      if (DRY) {
        console.log(`    [dry-run] would update product name/description`);
      } else {
        product = await stripe.products.update(product.id, {
          name: item.name,
          description: item.description,
        });
        console.log(`    updated product name/description`);
      }
    }
  } else {
    if (DRY) {
      console.log(`  product: DRY-RUN would create`);
      // Stub product en dry-run para que el resto del flujo siga
      product = {
        id: `prod_DRYRUN_${item.id}`,
        name: item.name,
        description: item.description,
        metadata: { source: SOURCE_TAG, catalog_id: item.id },
      } as unknown as Stripe.Product;
      productAction = 'created';
    } else {
      product = await stripe.products.create({
        name: item.name,
        description: item.description,
        metadata: { source: SOURCE_TAG, catalog_id: item.id },
      });
      productAction = 'created';
      console.log(`  product: CREATE ${product.id}`);
    }
  }

  // 2) Price
  let price: Stripe.Price | null = DRY && productAction === 'created' ? null : await findMatchingPrice(product.id, item);
  let priceAction: 'created' | 'reused' = 'reused';

  if (price) {
    console.log(`  price:   REUSE  ${price.id}`);
  } else {
    if (DRY) {
      console.log(`  price:   DRY-RUN would create unit_amount=${item.amount}, currency=${item.currency}, type=${item.type}${item.interval ? `, interval=${item.interval}` : ''}`);
      price = {
        id: `price_DRYRUN_${item.id}`,
        unit_amount: item.amount,
        currency: item.currency,
      } as unknown as Stripe.Price;
      priceAction = 'created';
    } else {
      const params: Stripe.PriceCreateParams = {
        product: product.id,
        unit_amount: item.amount,
        currency: item.currency,
        metadata: { source: SOURCE_TAG, catalog_id: item.id },
      };
      if (item.type === 'recurring' && item.interval) {
        params.recurring = { interval: item.interval };
      }
      price = await stripe.prices.create(params);
      priceAction = 'created';
      console.log(`  price:   CREATE ${price.id}`);

      // Archivar precios viejos del MISMO product (ej. cambio de amount). Solo si reutilizamos product.
      if (productAction === 'reused') {
        await archiveStalePrices(product.id, price.id);
      }
    }
  }

  return {
    catalogId: item.id,
    productId: product.id,
    priceId: price.id,
    action:
      DRY ? 'DRY-RUN' : productAction === 'created' || priceAction === 'created' ? 'CREATED' : 'REUSED',
  };
}

function writeOutputFile(resolved: Resolved[]) {
  const outPath = join(process.cwd(), 'src', 'config', 'stripe-prices.ts');
  const lines: string[] = [];
  lines.push('/**');
  lines.push(' * AUTO-GENERATED by scripts/seed-stripe.ts. Do not edit manually.');
  lines.push(` * Generated at: ${new Date().toISOString()}`);
  lines.push(` * Source: metadata.source = '${SOURCE_TAG}'`);
  lines.push(' */');
  lines.push('');
  lines.push("import type { CatalogId } from './catalog';");
  lines.push('');
  lines.push('export type StripePriceMapping = {');
  lines.push('  productId: string;');
  lines.push('  priceId: string;');
  lines.push('};');
  lines.push('');
  lines.push('export const STRIPE_PRICES: Record<CatalogId, StripePriceMapping> = {');
  for (const r of resolved) {
    lines.push(`  ${camelize(r.catalogId)}: { productId: '${r.productId}', priceId: '${r.priceId}' },`);
  }
  lines.push('};');
  lines.push('');

  if (DRY) {
    console.log(`\n[dry-run] would write ${outPath}`);
    return;
  }
  writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`\n✓ Wrote ${outPath}`);
}

function camelize(snake: string): string {
  return snake.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

async function main() {
  console.log('='.repeat(70));
  console.log(`Stripe seed — source='${SOURCE_TAG}'  ${DRY ? '(DRY RUN)' : '(LIVE)'}`);
  console.log('='.repeat(70));
  console.log('Items a procesar:', Object.keys(CATALOG).length);

  const items: CatalogItem[] = Object.values(CATALOG);
  const resolved: Resolved[] = [];

  for (const item of items) {
    const r = await ensureItem(item);
    resolved.push(r);
  }

  console.log('\n' + '='.repeat(70));
  console.log('Resumen:');
  for (const r of resolved) {
    console.log(`  ${r.action.padEnd(8)} ${r.catalogId.padEnd(32)} ${r.productId} / ${r.priceId}`);
  }

  writeOutputFile(resolved);

  if (DRY) {
    console.log('\n[DRY RUN] No se ha tocado Stripe ni el filesystem. Vuelve a ejecutar sin --dry-run para aplicar.');
  } else {
    console.log('\n✓ Seed completado.');
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
