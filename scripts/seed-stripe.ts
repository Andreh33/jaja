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
import { readFileSync, writeFileSync } from 'fs';
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

// Detecta el modo por el prefijo de la sk activa.
// El seed solo escribe en la sección del modo activo, preservando la otra.
function detectMode(secretKey: string): 'test' | 'live' {
  if (secretKey.startsWith('sk_live_')) return 'live';
  if (secretKey.startsWith('sk_test_')) return 'test';
  console.error(`ERROR: STRIPE_SECRET_KEY tiene un prefijo inesperado ("${secretKey.slice(0, 8)}..."). Debe empezar por sk_test_ o sk_live_.`);
  process.exit(1);
}
const MODE = detectMode(key);

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

/**
 * Lee el archivo actual y extrae el bloque opuesto (TEST_PRICES si estamos
 * regenerando LIVE, y al revés). Ese bloque se preserva tal cual al
 * regenerar el fichero. Si el archivo no existe o está corrupto, devuelve
 * un bloque con placeholders vacíos para los 16 catalog ids.
 */
function readPreservedBlock(filePath: string, oppositeMode: 'test' | 'live'): string {
  const blockName = oppositeMode === 'test' ? 'TEST_PRICES' : 'LIVE_PRICES';
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch {
    return defaultEmptyBlock(blockName);
  }
  // Captura desde "const TEST_PRICES" o "const LIVE_PRICES" hasta el ";\n" de cierre.
  const re = new RegExp(`const ${blockName}: Record<CatalogId, StripePriceMapping> = \\{[\\s\\S]*?\\n\\};`);
  const match = raw.match(re);
  if (!match) {
    console.warn(`  ⚠️  No encontré el bloque ${blockName} en el archivo actual. Se generará uno vacío.`);
    return defaultEmptyBlock(blockName);
  }
  return match[0];
}

function defaultEmptyBlock(blockName: string): string {
  const lines: string[] = [];
  lines.push(`const ${blockName}: Record<CatalogId, StripePriceMapping> = {`);
  for (const item of Object.values(CATALOG)) {
    lines.push(`  ${camelize(item.id)}: { productId: '', priceId: '' },`);
  }
  lines.push('};');
  return lines.join('\n');
}

function writeOutputFile(resolved: Resolved[]) {
  const outPath = join(process.cwd(), 'src', 'config', 'stripe-prices.ts');
  const blockName = MODE === 'test' ? 'TEST_PRICES' : 'LIVE_PRICES';
  const oppositeMode: 'test' | 'live' = MODE === 'test' ? 'live' : 'test';
  const preservedBlock = readPreservedBlock(outPath, oppositeMode);

  // Bloque del modo activo (recién generado).
  const activeBlockLines: string[] = [];
  activeBlockLines.push(`const ${blockName}: Record<CatalogId, StripePriceMapping> = {`);
  for (const r of resolved) {
    activeBlockLines.push(`  ${camelize(r.catalogId)}: { productId: '${r.productId}', priceId: '${r.priceId}' },`);
  }
  activeBlockLines.push('};');
  const activeBlock = activeBlockLines.join('\n');

  // Orden estable: TEST primero, LIVE segundo.
  const testBlock = MODE === 'test' ? activeBlock : preservedBlock;
  const liveBlock = MODE === 'live' ? activeBlock : preservedBlock;

  const out: string[] = [];
  out.push('/**');
  out.push(' * AUTO-GENERATED by scripts/seed-stripe.ts. Do not edit manually.');
  out.push(' *');
  out.push(' * Estructura dual: los IDs de la cuenta Stripe TEST y la cuenta LIVE');
  out.push(' * conviven en este fichero. El cliente (lib/stripe.ts) detecta el');
  out.push(' * modo por el prefijo de STRIPE_SECRET_KEY (sk_test_ vs sk_live_) y');
  out.push(' * `getCurrentPrices()` devuelve la sección correcta.');
  out.push(' *');
  out.push(' * El script de seed solo sobrescribe la sección correspondiente al');
  out.push(' * modo en el que se ejecuta — la otra queda intacta.');
  out.push(' */');
  out.push('');
  out.push("import type { CatalogId } from './catalog';");
  out.push('');
  out.push('export type StripePriceMapping = {');
  out.push('  productId: string;');
  out.push('  priceId: string;');
  out.push('};');
  out.push('');
  out.push("export type StripeMode = 'test' | 'live';");
  out.push('');
  out.push('/**');
  out.push(` * Última actualización ${MODE === 'test' ? 'TEST' : 'LIVE'}: ${new Date().toISOString()}`);
  out.push(` * Source: metadata.source = '${SOURCE_TAG}'`);
  out.push(' */');
  out.push(testBlock);
  out.push('');
  out.push(liveBlock);
  out.push('');
  out.push('export const STRIPE_PRICES: Record<StripeMode, Record<CatalogId, StripePriceMapping>> = {');
  out.push('  test: TEST_PRICES,');
  out.push('  live: LIVE_PRICES,');
  out.push('};');
  out.push('');

  if (DRY) {
    console.log(`\n[dry-run] would write ${outPath} (mode=${MODE}, preservó bloque ${oppositeMode.toUpperCase()})`);
    return;
  }
  writeFileSync(outPath, out.join('\n'), 'utf8');
  console.log(`\n✓ Wrote ${outPath} (mode=${MODE}, preservó bloque ${oppositeMode.toUpperCase()})`);
}

function camelize(snake: string): string {
  return snake.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

async function main() {
  console.log('='.repeat(70));
  console.log(`Stripe seed — source='${SOURCE_TAG}'  mode=${MODE.toUpperCase()}  ${DRY ? '(DRY RUN)' : '(APPLY)'}`);
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
