/**
 * Reconciliación de subscriptions contra Stripe.
 *
 * Casos cubiertos:
 *   - Eventos de Stripe perdidos / handlers que fallaron silenciosamente
 *     (p.ej. status='incomplete' que ya debería ser 'active', periods nulos,
 *     items desincronizados con Stripe).
 *
 * Uso:
 *   npx tsx scripts/reconcile-subscriptions.ts        → solo filas incompletas
 *   npx tsx scripts/reconcile-subscriptions.ts --all  → barre toda la tabla
 *
 * Idempotente: re-ejecutar es seguro. Solo escribe si los datos de Stripe
 * difieren de los de la BBDD local.
 *
 * Pensado también como base reutilizable para un job nightly futuro.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import Stripe from 'stripe';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq, isNull, or, sql } from 'drizzle-orm';
import { subscriptions } from '../drizzle/schema';
import {
  extractSubscriptionCadence,
  extractSubscriptionPeriods,
} from '../src/lib/stripe-shape-helpers';

const FINAL_STATUSES = new Set(['canceled', 'incomplete_expired']);

function getEnv(key: string): string {
  const v = process.env[key];
  if (!v) {
    console.error(`[reconcile] missing env ${key}`);
    process.exit(1);
  }
  return v;
}

const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY'), {
  apiVersion: '2026-04-22.dahlia',
});
const client = createClient({
  url: getEnv('TURSO_DATABASE_URL'),
  authToken: getEnv('TURSO_AUTH_TOKEN'),
});
const db = drizzle(client);

type LocalRow = typeof subscriptions.$inferSelect;

function rowsDiffer(local: LocalRow, fresh: {
  status: string;
  start: number | null;
  end: number | null;
  cancelAtPeriodEnd: boolean;
  cadence: 'monthly' | 'yearly' | null;
}): boolean {
  return (
    local.status !== fresh.status ||
    local.currentPeriodStart !== fresh.start ||
    local.currentPeriodEnd !== fresh.end ||
    !!local.cancelAtPeriodEnd !== fresh.cancelAtPeriodEnd ||
    (fresh.cadence !== null && local.cadence !== fresh.cadence)
  );
}

async function main() {
  const all = process.argv.includes('--all');
  console.log(`[reconcile] mode=${all ? 'all' : 'incomplete-only'}`);

  const rows = all
    ? await db.select().from(subscriptions)
    : await db
        .select()
        .from(subscriptions)
        .where(or(eq(subscriptions.status, 'incomplete'), isNull(subscriptions.currentPeriodEnd)));

  console.log(`[reconcile] candidates=${rows.length}`);
  if (rows.length === 0) {
    console.log('[reconcile] nothing to do');
    return;
  }

  let updated = 0;
  let skipped = 0;
  let errored = 0;

  for (const row of rows) {
    const subId = row.stripeSubscriptionId;
    try {
      const sub = await stripe.subscriptions.retrieve(subId);
      const periods = extractSubscriptionPeriods(sub);
      const detectedCadence = extractSubscriptionCadence(sub);
      const cancelAtPeriodEnd = !!(sub as unknown as { cancel_at_period_end?: boolean }).cancel_at_period_end;
      const fresh = {
        status: sub.status,
        start: periods.start,
        end: periods.end,
        cancelAtPeriodEnd,
        // null aquí significa "no escribir cadence" (helper devolvió 'unknown').
        cadence: detectedCadence === 'unknown' ? null : detectedCadence,
      };

      if (!rowsDiffer(row, fresh)) {
        skipped++;
        console.log(`[reconcile] sub_id=${subId} result=already_in_sync status=${row.status}`);
        continue;
      }

      // NO tocamos `items`: Stripe no devuelve los one-time line items como
      // `sub.items.data` (solo los recurring), así que sobrescribir aquí
      // borra el carrito histórico que checkout.session.completed guardó.
      // Las mutaciones de items son responsabilidad de
      // customer.subscription.updated cuando Stripe las dispara.
      const setObj: Record<string, unknown> = {
        status: fresh.status,
        currentPeriodStart: fresh.start,
        currentPeriodEnd: fresh.end,
        cancelAtPeriodEnd: fresh.cancelAtPeriodEnd,
        updatedAt: sql`(unixepoch())`,
      };
      if (fresh.cadence !== null) {
        setObj.cadence = fresh.cadence;
      } else {
        console.warn(
          `[reconcile] sub_id=${subId} reason=cadence_unknown — keeping local cadence=${row.cadence}`,
        );
      }
      await db.update(subscriptions).set(setObj).where(eq(subscriptions.id, row.id));
      updated++;
      console.log(
        `[reconcile] sub_id=${subId} result=updated status:${row.status}->${fresh.status} period_end:${row.currentPeriodEnd}->${fresh.end} cadence:${row.cadence}->${fresh.cadence ?? row.cadence}`,
      );

      if (FINAL_STATUSES.has(fresh.status)) {
        console.log(`[reconcile] sub_id=${subId} note=final_status=${fresh.status}`);
      }
    } catch (err) {
      errored++;
      console.error(`[reconcile] sub_id=${subId} result=error err="${(err as Error).message}"`);
    }
  }

  console.log(
    `[reconcile] done updated=${updated} skipped=${skipped} errored=${errored} total=${rows.length}`,
  );
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error('[reconcile] fatal:', err);
    process.exit(1);
  },
);
