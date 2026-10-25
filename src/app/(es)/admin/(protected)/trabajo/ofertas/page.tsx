import Link from 'next/link';
import { Plus, Briefcase } from 'lucide-react';
import { listOffersWithCounts } from '@/lib/admin-jobs';
import OffersTable from './_components/OffersTable';

export const dynamic = 'force-dynamic';

export default async function AdminOfertasPage() {
  const offers = await listOffersWithCounts();

  // Serializa fechas para pasarlas al client component.
  const serialized = offers.map((o) => ({
    id: o.id,
    slug: o.slug,
    title: o.title,
    location: o.location,
    status: o.status as 'borrador' | 'publicada' | 'cerrada',
    publishedAtMs: o.publishedAt ? o.publishedAt * 1000 : null,
    applicationsCount: o.applicationsCount,
  }));

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
            Ofertas de empleo
          </h1>
          <p className="mt-2 text-sm text-white/55">{offers.length} ofertas registradas en total.</p>
        </div>
        <Link
          href="/admin/trabajo/ofertas/nueva"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-black"
          style={{ background: 'var(--accent-calc)' }}
        >
          <Plus size={14} /> Nueva oferta
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: 'var(--border-subtle)' }}>
          <Briefcase size={32} className="mx-auto text-white/30" />
          <p className="mt-4 text-sm text-white/55">Aún no hay ofertas creadas.</p>
          <Link
            href="/admin/trabajo/ofertas/nueva"
            className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-black"
            style={{ background: 'var(--accent-calc)' }}
          >
            <Plus size={14} /> Crear primera oferta
          </Link>
        </div>
      ) : (
        <OffersTable offers={serialized} />
      )}
    </div>
  );
}
