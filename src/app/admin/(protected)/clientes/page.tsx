import { db } from '@/lib/db';
import { users, archivos, empresas } from '../../../../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminClientesPage() {
  const clients = await db.select().from(users).where(eq(users.role, 'CLIENT')).orderBy(desc(users.createdAt));
  const allFiles = await db.select().from(archivos);
  const allEmpresas = await db.select().from(empresas);

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Clientes
      </h1>
      <p className="mt-2 text-sm text-white/55">Listado completo de clientes registrados.</p>

      <div className="mt-8 overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[10px] uppercase tracking-wider text-white/40" style={{ borderColor: 'var(--border-subtle)' }}>
              <th className="px-5 py-3.5">Cliente</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Teléfono</th>
              <th className="px-5 py-3.5 text-center">Archivos</th>
              <th className="px-5 py-3.5">Servicios</th>
              <th className="px-5 py-3.5">Registrado</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {clients.map((c) => {
              const filesCount = allFiles.filter((f) => f.userId === c.id).length;
              const emp = allEmpresas.find((e) => e.userId === c.id);
              const services = (emp?.serviciosContratados as string[] | null) || [];
              return (
                <tr key={c.id} className="transition-colors hover:bg-white/5">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: 'var(--grad-signature)' }}>
                        {(c.name?.[0] || c.email[0]).toUpperCase()}
                      </div>
                      <span className="text-white">{c.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white/65">{c.email}</td>
                  <td className="px-5 py-4 text-white/65">{c.phone || '—'}</td>
                  <td className="px-5 py-4 text-center text-white/85">{filesCount}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {services.includes('web') && <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-web)' }}>web</span>}
                      {services.includes('tienda') && <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--accent-shop)' }}>tienda</span>}
                      {services.includes('ia') && <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-ia)' }}>ia</span>}
                      {services.length === 0 && <span className="text-xs text-white/30">—</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white/55">{c.createdAt ? formatDate(c.createdAt) : '—'}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/clientes/${c.id}`} className="text-xs text-white/65 hover:text-white link-underline">Ver →</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="py-12 text-center text-sm text-white/45">Aún no hay clientes registrados.</div>
        )}
      </div>
    </div>
  );
}
