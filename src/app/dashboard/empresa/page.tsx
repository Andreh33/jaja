import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { empresas } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import EmpresaForm from '@/components/dashboard/EmpresaForm';

export const dynamic = 'force-dynamic';

export default async function EmpresaPage() {
  const session = await auth();
  const r = await db.select().from(empresas).where(eq(empresas.userId, session!.user.id)).limit(1);
  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Mi empresa
      </h1>
      <p className="mt-2 text-sm text-white/55">
        Toda la información que necesitamos para crear tu web. Cuanto más detalle, mejor.
      </p>
      <div className="mt-8">
        <EmpresaForm initial={r[0] || null} />
      </div>
    </div>
  );
}
