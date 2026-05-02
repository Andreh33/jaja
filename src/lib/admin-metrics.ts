/**
 * Métricas de negocio agregadas para el dashboard admin.
 *
 * Fuente: BBDD local (tabla `subscriptions`). Sin llamadas a Stripe.
 * Se considera "activo" solo `status = 'active'` para MRR (no trialing,
 * no past_due — esos no representan ingreso garantizado).
 *
 * Limitación conocida: el cálculo de MRR usa el snapshot del cart
 * almacenado en `subscriptions.items` en el momento del checkout. Si el
 * cliente cambia el plan vía Customer Portal y el webhook
 * `customer.subscription.updated` no llega, el MRR queda desactualizado.
 * El reconcile script puede sincronizar el resto de campos pero NO
 * sobrescribe items para no perder los one-time del primer cobro.
 */

import { and, eq } from 'drizzle-orm';
import { db } from './db';
import { subscriptions } from '../../drizzle/schema';
import { isRecurringCatalogId } from '@/config/catalog';

type CartLineLocal = { catalog_id: string; quantity?: number; amount_subtotal?: number };

export type BusinessMetrics = {
  activeClients: number;
  mrrCents: number;
  arrCents: number;
};

export async function getBusinessMetrics(): Promise<BusinessMetrics> {
  const activeSubs = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.status, 'active')));

  // activeClients: usuarios distintos con al menos una sub activa.
  const distinctUsers = new Set<string>();
  for (const s of activeSubs) distinctUsers.add(s.userId);

  // MRR: por cada sub activa, suma de items recurring; si yearly, dividir entre 12.
  // Resultado en céntimos. Redondeo al céntimo más cercano al final.
  let mrrCentsRaw = 0;
  for (const sub of activeSubs) {
    const items = (sub.items as CartLineLocal[] | null) ?? [];
    let recurringTotal = 0;
    for (const it of items) {
      if (!isRecurringCatalogId(it.catalog_id)) continue;
      recurringTotal += it.amount_subtotal ?? 0;
    }
    if (sub.cadence === 'yearly') {
      mrrCentsRaw += recurringTotal / 12;
    } else {
      mrrCentsRaw += recurringTotal;
    }
  }
  const mrrCents = Math.round(mrrCentsRaw);
  const arrCents = mrrCents * 12;

  return {
    activeClients: distinctUsers.size,
    mrrCents,
    arrCents,
  };
}
