import { db } from '@/lib/db';
import { users, archivos, subscriptions } from '../../../../../drizzle/schema';
import { eq, desc, ne, and, or, like, sql } from 'drizzle-orm';
import { categoryFromCatalogId, type ServiceCategory } from '@/config/catalog';
import ClientList, { type ClientRow } from './ClientList';

export const dynamic = 'force-dynamic';

type CartLineLocal = { catalog_id: string; quantity?: number; amount_subtotal?: number };

const CLIENT_SIDE_THRESHOLD = 50;

function escapeLike(s: string): string {
  // Escape SQL LIKE wildcards. Usamos `\` como escape char (drizzle libsql lo soporta).
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const rawQuery = (sp.q ?? '').trim();

  // 1. Total de clientes para decidir client-side vs server-side.
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.role, 'CLIENT'));

  const useServerSide = total >= CLIENT_SIDE_THRESHOLD;

  // 2. Cargar lista (filtrada en SQL si server-side, completa si client-side).
  let clientsQuery = db
    .select()
    .from(users)
    .where(eq(users.role, 'CLIENT'))
    .$dynamic();

  if (useServerSide && rawQuery) {
    const pattern = `%${escapeLike(rawQuery.toLowerCase())}%`;
    clientsQuery = db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, 'CLIENT'),
          or(like(sql`lower(${users.name})`, pattern), like(sql`lower(${users.email})`, pattern)),
        ),
      )
      .$dynamic();
  }

  const clients = await clientsQuery.orderBy(desc(users.createdAt));

  // 3. Datos auxiliares: archivos y subs activas.
  const [allFiles, allActiveSubs] = await Promise.all([
    db.select().from(archivos),
    db
      .select()
      .from(subscriptions)
      .where(
        and(
          ne(subscriptions.status, 'canceled'),
          ne(subscriptions.status, 'incomplete_expired'),
        ),
      ),
  ]);

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

  const filesCountByUser = new Map<string, number>();
  for (const f of allFiles) {
    filesCountByUser.set(f.userId, (filesCountByUser.get(f.userId) ?? 0) + 1);
  }

  const rows: ClientRow[] = clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAtMs: c.createdAt ? c.createdAt.getTime() : null,
    filesCount: filesCountByUser.get(c.id) ?? 0,
    services: Array.from(servicesByUser.get(c.id) ?? new Set<ServiceCategory>()),
  }));

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Clientes
      </h1>
      <p className="mt-2 text-sm text-white/55">Listado completo de clientes registrados.</p>

      {useServerSide ? (
        <ClientList mode="server" rows={rows} total={total} initialQuery={rawQuery} />
      ) : (
        <ClientList mode="client" rows={rows} total={total} initialQuery={rawQuery} />
      )}
    </div>
  );
}
