import { db } from '@/lib/db';
import { users, archivos, subscriptions } from '../../../../../drizzle/schema';
import { eq, desc, ne, and } from 'drizzle-orm';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { categoryFromCatalogId, type ServiceCategory } from '@/config/catalog';

export const dynamic = 'force-dynamic';

type CartLineLocal = { catalog_id: string; quantity?: number; amount_subtotal?: number };

export default async function AdminClientesPage() {
  const clients = await db.select().from(users).where(eq(users.role, 'CLIENT')).orderBy(desc(users.createdAt));
  const allFiles = await db.select().from(archivos);
  // Subs activas (no terminales) para todos los clientes en una sola query.
  const allActiveSubs = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        ne(subscriptions.status, 'canceled'),
        ne(subscriptions.status, 'incomplete_expired'),
      ),
    );
  // Mapa userId → Set<categoría>. Si un user tiene varias subs activas
  // (no debería con nuestro flujo actual, pero defensivo), agregamos.
  const servicesByUser = new Map<string, Set<ServiceCategory>>();
  for (const sub of allActiveSubs) {
    const items = (sub.items as CartLineLocal[] | null) ?? [];
    let bucket = servicesByUser.get(sub.userId);
    if (!bucket) {
      bucket = new Set<ServiceCategory>();
      servicesByUser.set(sub.userId, bucket);
    }
    for (const it of items) {
      const cat = categoryFromCatalogId(it.catalog_id);
      if (cat) bucket.add(cat);
    }
  }

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
              const services = servicesByUser.get(c.id) ?? new Set<ServiceCategory>();
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
                      {services.has('web') && <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-web)' }}>web</span>}
                      {services.has('tienda') && <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--accent-shop)' }}>tienda</span>}
                      {services.has('ia') && <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-ia)' }}>ia</span>}
                      {services.size === 0 && <span className="text-xs text-white/30">—</span>}
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
