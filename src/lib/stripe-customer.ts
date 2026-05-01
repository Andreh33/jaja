import { stripe } from './stripe';
import { db } from './db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Resuelve el Stripe Customer asociado a un user de la BBDD.
 *
 * Orden:
 *   1. Si users.stripe_customer_id existe → retrieve por id.
 *   2. Si no, list({ email, limit: 1 }) → si existe, reutilizar el id y guardarlo.
 *   3. Si tampoco existe en Stripe → create.
 *
 * Esto evita duplicados con el mismo email (puede haberlos de los Stripe Links
 * viejos o de tests previos).
 */
export async function resolveOrCreateCustomer(args: {
  userId: string;
  email: string;
  name?: string;
  phone?: string;
}): Promise<string> {
  // 1. ¿Tenemos ya el id en BBDD?
  const rows = await db
    .select({ id: users.id, stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, args.userId))
    .limit(1);

  const existingId = rows[0]?.stripeCustomerId;
  if (existingId) {
    try {
      const c = await stripe.customers.retrieve(existingId);
      if (!('deleted' in c && c.deleted)) {
        return existingId;
      }
      // Si está borrado en Stripe, caemos al siguiente paso.
    } catch {
      // No existe / inválido → caer al siguiente paso.
    }
  }

  // 2. Buscar por email en Stripe.
  const list = await stripe.customers.list({ email: args.email, limit: 1 });
  if (list.data.length > 0) {
    const reused = list.data[0].id;
    await db
      .update(users)
      .set({ stripeCustomerId: reused })
      .where(eq(users.id, args.userId));
    return reused;
  }

  // 3. Crear.
  const created = await stripe.customers.create({
    email: args.email,
    name: args.name,
    phone: args.phone,
    metadata: { user_id: args.userId },
  });
  await db
    .update(users)
    .set({ stripeCustomerId: created.id })
    .where(eq(users.id, args.userId));
  return created.id;
}
