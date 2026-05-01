import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '../../../../drizzle/schema';
import { resolveOrCreateCustomer } from '@/lib/stripe-customer';
import { buildCheckoutSessionParams } from '@/lib/checkout-builder';
import { stripe } from '@/lib/stripe';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const selectionSchema = z.object({
  webPagesOver8: z.boolean(),
  hostingCadence: z.enum(['monthly', 'yearly']),
  tienda: z.boolean(),
  social: z.boolean(),
  aiAgent: z.enum(['none', 'web', 'phone']),
  blogPosts: z.number().int().min(0).max(100),
  logo: z.boolean(),
});

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[+\d\s]{6,20}$/),
  company: z.string().max(120).optional(),
  password: z
    .string()
    .min(8)
    .max(200)
    .regex(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/, 'Contraseña débil'),
  isExistingEmail: z.boolean().nullable(),
});

const bodySchema = z.object({
  selection: selectionSchema,
  contact: contactSchema,
});

const GENERIC_AUTH_ERROR =
  'No hemos podido verificar tu cuenta. Revisa tus credenciales o intenta recuperar la contraseña.';

export async function POST(req: Request) {
  // Rate limit ligero por IP — protege /api/checkout de abuso.
  const ip = getClientIp(req);
  const rl = rateLimit(`checkout:${ip}`, { max: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    console.warn(`[rate-limit] checkout blocked ip=${ip} resetMs=${rl.resetMs}`);
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Espera un momento.' },
      { status: 429 },
    );
  }

  // Fail-loud si falta NEXT_PUBLIC_APP_URL.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.error('[checkout] NEXT_PUBLIC_APP_URL missing in env. Cannot build success/cancel URLs.');
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta. Avisa al equipo.' },
      { status: 500 },
    );
  }

  // Parse + validación.
  let parsed: z.infer<typeof bodySchema>;
  try {
    const body = await req.json();
    const r = bodySchema.safeParse(body);
    if (!r.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    parsed = r.data;
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const { selection, contact } = parsed;
  const email = contact.email.toLowerCase().trim();

  // 1. Resolver / crear usuario en BBDD.
  let userId: string;
  let userName: string | undefined;
  try {
    const existing = await db
      .select({ id: users.id, password: users.password, name: users.name })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      // LOGIN
      const u = existing[0];
      const ok = await bcrypt.compare(contact.password, u.password);
      if (!ok) {
        return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
      }
      userId = u.id;
      userName = u.name ?? contact.name;
    } else {
      // REGISTRO
      const hashed = await bcrypt.hash(contact.password, 10);
      const [created] = await db
        .insert(users)
        .values({
          email,
          password: hashed,
          name: contact.name,
          phone: contact.phone,
          role: 'CLIENT',
        })
        .returning({ id: users.id, name: users.name });
      userId = created.id;
      userName = created.name ?? contact.name;
    }
  } catch (err) {
    console.error('[checkout] user resolve/create failed:', err);
    return NextResponse.json(
      { error: 'No hemos podido procesar tu cuenta. Inténtalo de nuevo.' },
      { status: 500 },
    );
  }

  // 2. Resolver / crear Stripe Customer.
  let customerId: string;
  try {
    customerId = await resolveOrCreateCustomer({
      userId,
      email,
      name: userName,
      phone: contact.phone,
    });
  } catch (err) {
    console.error('[checkout] stripe customer resolve failed:', err);
    return NextResponse.json(
      { error: 'No hemos podido conectar con la pasarela de pago.' },
      { status: 502 },
    );
  }

  // 3. Construir y crear la Checkout Session.
  // Metadata mínima (límite 500 chars). El webhook reconstruye la selección
  // desde line_items (priceId → catalogId vía stripe-prices.ts).
  const metadata: Record<string, string> = {
    user_id: userId,
    calculator_version: 'v1',
    phone_agent: selection.aiAgent === 'phone' ? 'yes' : 'no',
  };

  const successUrl = `${appUrl}/dashboard/facturacion?status=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appUrl}/tienda/calculadora?status=cancelled`;

  try {
    const params = buildCheckoutSessionParams({
      selection,
      stripeCustomerId: customerId,
      successUrl,
      cancelUrl,
      metadata,
    });
    const session = await stripe.checkout.sessions.create(params);
    if (!session.url) {
      console.error('[checkout] session.url null; session=', session.id);
      return NextResponse.json({ error: 'No hemos podido crear la sesión de pago.' }, { status: 502 });
    }
    console.log(
      `[checkout] session created session=${session.id} customer=${customerId} user=${userId} mode=${session.mode}`,
    );
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] stripe session create failed:', err);
    return NextResponse.json(
      { error: 'No hemos podido crear la sesión de pago.' },
      { status: 502 },
    );
  }
}
