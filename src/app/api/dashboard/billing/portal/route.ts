/**
 * POST /api/dashboard/billing/portal
 *
 * Crea una Billing Portal Session de Stripe para el usuario logueado y
 * devuelve `{ url }`. El cliente redirige el navegador a esa URL.
 *
 * Errores manejados:
 *   - Usuario sin sesión              → 401
 *   - User sin stripe_customer_id     → 400 + mensaje "no_customer"
 *   - Customer Portal no configurado  → 503 + mensaje "portal_not_configured"
 *     (se reconoce por err.code = 'billing_portal_configuration_invalid' o
 *     mensaje de Stripe que menciona "No configuration provided"). En ese
 *     caso logueamos LOUD para que el operador active el portal en
 *     dashboard.stripe.com → Settings → Billing → Customer portal.
 *   - Cualquier otro error            → 502 + log
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '../../../../../../drizzle/schema';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

function isPortalNotConfigured(err: unknown): boolean {
  const e = err as { code?: string; message?: string; type?: string };
  if (e?.code === 'billing_portal_configuration_invalid') return true;
  const msg = e?.message ?? '';
  return /no configuration provided|portal.*configuration/i.test(msg);
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.error('[portal] NEXT_PUBLIC_APP_URL missing — cannot build return_url.');
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta.' },
      { status: 500 },
    );
  }

  const u = (
    await db
      .select({ stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
  )[0];

  if (!u?.stripeCustomerId) {
    return NextResponse.json(
      { error: 'no_customer', message: 'Aún no tienes un plan activo.' },
      { status: 400 },
    );
  }

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: u.stripeCustomerId,
      return_url: `${appUrl}/dashboard/facturacion`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    if (isPortalNotConfigured(err)) {
      console.error(
        `[portal] result=error reason=portal_not_configured user_id=${session.user.id} stripe_customer_id=${u.stripeCustomerId} — Activate Customer Portal at dashboard.stripe.com → Settings → Billing → Customer portal (test mode).`,
      );
      return NextResponse.json(
        {
          error: 'portal_not_configured',
          message:
            'Función no disponible temporalmente, contacta soporte.',
        },
        { status: 503 },
      );
    }
    const msg = (err as Error)?.message ?? 'unknown';
    console.error(
      `[portal] result=error user_id=${session.user.id} err="${msg}"`,
    );
    return NextResponse.json(
      { error: 'portal_error', message: 'No hemos podido abrir el portal de facturación.' },
      { status: 502 },
    );
  }
}
