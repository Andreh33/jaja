import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import {
  CURSO_COOKIE,
  normalizePhone,
  signCommercialToken,
  cursoCookieOptions,
} from '@/lib/curso-auth';

const bodySchema = z.object({
  name: z.string().trim().min(2, 'Nombre demasiado corto').max(80),
  phone: z.string().min(6).max(30),
});

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Introduce tu nombre y teléfono.' }, { status: 400 });
    }
    const name = parsed.data.name.trim();
    const phone = normalizePhone(parsed.data.phone);
    if (phone.length < 7) {
      return NextResponse.json({ error: 'El teléfono no es válido.' }, { status: 400 });
    }

    // Upsert por teléfono normalizado (clave única estable).
    const existing = await db
      .select()
      .from(schema.commercials)
      .where(eq(schema.commercials.phone, phone))
      .limit(1);

    let commercialId: string;
    if (existing.length > 0) {
      commercialId = existing[0].id;
      // Mantener el nombre más reciente.
      if (existing[0].name !== name) {
        await db
          .update(schema.commercials)
          .set({ name })
          .where(eq(schema.commercials.id, commercialId));
      }
    } else {
      const inserted = await db
        .insert(schema.commercials)
        .values({ name, phone })
        .returning({ id: schema.commercials.id });
      commercialId = inserted[0].id;
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(CURSO_COOKIE, signCommercialToken(commercialId), cursoCookieOptions());
    return res;
  } catch (err) {
    console.error('[cursos/login] error', err);
    return NextResponse.json({ error: 'Error en el servidor.' }, { status: 500 });
  }
}
