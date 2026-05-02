'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Offer = {
  id: string;
  slug: string;
  title: string;
  location: string;
  status: 'borrador' | 'publicada' | 'cerrada';
  publishedAtMs: number | null;
  applicationsCount: number;
};

const STATUS_BADGE: Record<Offer['status'], { label: string; bg: string; fg: string }> = {
  borrador: { label: 'Borrador', bg: 'rgba(255,255,255,0.06)', fg: 'rgba(255,255,255,0.7)' },
  publicada: { label: 'Publicada', bg: 'rgba(34,197,94,0.12)', fg: '#22c55e' },
  cerrada: { label: 'Cerrada', bg: 'rgba(234,179,8,0.12)', fg: '#eab308' },
};

const FILTERS: Array<{ value: 'all' | Offer['status']; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'publicada', label: 'Publicadas' },
  { value: 'cerrada', label: 'Cerradas' },
];

export default function OffersTable({ offers }: { offers: Offer[] }) {
  const [filter, setFilter] = useState<'all' | Offer['status']>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? offers : offers.filter((o) => o.status === filter)),
    [offers, filter],
  );

  const fmt = (ms: number | null) =>
    ms
      ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(ms))
      : '—';

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                active ? 'text-white' : 'text-white/55 hover:text-white'
              }`}
              style={
                active
                  ? { background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.40)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[10px] uppercase tracking-wider text-white/40" style={{ borderColor: 'var(--border-subtle)' }}>
              <th className="px-5 py-3.5">Título</th>
              <th className="px-5 py-3.5">Estado</th>
              <th className="px-5 py-3.5">Ubicación</th>
              <th className="px-5 py-3.5 text-center">Candidaturas</th>
              <th className="px-5 py-3.5">Publicada</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {filtered.map((o) => {
              const badge = STATUS_BADGE[o.status];
              return (
                <tr key={o.id} className="transition-colors hover:bg-white/5">
                  <td className="px-5 py-4">
                    <div className="text-white">{o.title}</div>
                    <div className="font-mono text-[10px] text-white/35">/empleo/{o.slug}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: badge.bg, color: badge.fg }}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/65">{o.location}</td>
                  <td className="px-5 py-4 text-center text-white/85">{o.applicationsCount}</td>
                  <td className="px-5 py-4 text-white/55">{fmt(o.publishedAtMs)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/trabajo/ofertas/${o.id}`} className="text-xs text-white/65 hover:text-white link-underline">
                      Editar →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-white/45">
            Sin ofertas en este filtro.
          </div>
        )}
      </div>
    </>
  );
}
