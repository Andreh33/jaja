import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { resolveOrCreateUser, getUserById } from '@/lib/user-auth';
import { resolveOrCreateCustomer } from '@/lib/stripe-customer';
import { stripe, getCurrentPrices } from '@/lib/stripe';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

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
  isExistingEmail: z.boolean().nullable().optional(),
});

const bodySchema = z.object({
  hours: z.number().int().min(1).max(500),
  contact: contactSchema.optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`checkout-seo:${ip}`, { max: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    console.warn(`[rate-limit] checkout-seo blocked ip=${ip} resetMs=${rl.resetMs}`);
    return NextResponse.json(
      { error: 'Demasiadas peticiones. Espera un momento.' },
      { status: 429 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.error('[checkout-seo] NEXT_PUBLIC_APP_URL missing in env.');
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta. Avisa al equipo.' },
      { status: 500 },
    );
  }

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

  // 1. Resolver user: prioridad a sesión.
  const session = await auth();
  let userId: string;
  let userEmail: string;
  let userName: string;
  let userPhone: string | undefined;

  if (session?.user?.id) {
    const u = await getUserById(session.user.id);
    if (!u) {
      console.error('[checkout-seo] session.user.id not found in db:', session.user.id);
      return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
    }
    userId = u.id;
    userEmail = u.email;
    userName = u.name ?? '';
    userPhone = u.phone ?? undefined;
  } else {
    if (!parsed.contact) {
      return NextResponse.json({ error: 'Datos de contacto requeridos.' }, { status: 400 });
    }
    const result = await resolveOrCreateUser({
      name: parsed.contact.name,
      email: parsed.contact.email,
      phone: parsed.contact.phone,
      password: parsed.contact.password,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    userId = result.userId;
    userEmail = parsed.contact.email.toLowerCase().trim();
    userName = result.userName;
    userPhone = result.phone;
  }

  // 2. Stripe Customer.
  let customerId: string;
  try {
    customerId = await resolveOrCreateCustomer({
      userId,
      email: userEmail,
      name: userName,
      phone: userPhone,
    });
  } catch (err) {
    console.error('[checkout-seo] stripe customer resolve failed:', err);
    return NextResponse.json(
      { error: 'No hemos podido conectar con la pasarela de pago.' },
      { status: 502 },
    );
  }

  // 3. Sesión de pago: mode payment con seo_hour × N.
  const metadata: Record<string, string> = {
    user_id: userId,
    calculator_version: 'v1',
    flow: 'seo_hours',
    seo_hours: String(parsed.hours),
  };

  const successUrl = `${appUrl}/dashboard/facturacion?status=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${appUrl}/tienda/calculadora?status=cancelled`;

  try {
    const prices = getCurrentPrices();
    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [
        {
          price: prices.seoHour.priceId,
          quantity: parsed.hours,
        },
      ],
      payment_method_types: ['card'],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    if (!stripeSession.url) {
      console.error('[checkout-seo] session.url null; session=', stripeSession.id);
      return NextResponse.json({ error: 'No hemos podido crear la sesión de pago.' }, { status: 502 });
    }
    console.log(
      `[checkout-seo] session created session=${stripeSession.id} customer=${customerId} user=${userId} hours=${parsed.hours} authedSession=${!!session?.user}`,
    );
    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error('[checkout-seo] stripe session create failed:', err);
    return NextResponse.json(
      { error: 'No hemos podido crear la sesión de pago.' },
      { status: 502 },
    );
  }
}
