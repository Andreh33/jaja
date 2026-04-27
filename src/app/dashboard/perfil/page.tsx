import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import PerfilForm from './PerfilForm';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const session = await auth();
  const r = await db.select().from(users).where(eq(users.id, session!.user.id)).limit(1);
  const u = r[0];
  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Perfil
      </h1>
      <p className="mt-2 text-sm text-white/55">Gestiona tu información personal.</p>
      <div className="mt-8 max-w-2xl">
        <PerfilForm user={{ name: u?.name || '', email: u?.email || '', phone: u?.phone || '' }} />
      </div>
    </div>
  );
}
