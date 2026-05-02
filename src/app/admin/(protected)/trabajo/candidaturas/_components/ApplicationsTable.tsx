'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type App = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  status: 'pendiente' | 'contactado' | 'descartado' | 'contratado';
  jobOfferId: string | null;
  offerTitle: string | null;
  createdAtMs: number | null;
};

const STATUS_BADGE: Record<App['status'], { label: string; bg: string; fg: string }> = {
  pendiente: { label: 'Pendiente', bg: 'rgba(234,179,8,0.12)', fg: '#eab308' },
  contactado: { label: 'Contactado', bg: 'rgba(59,130,246,0.12)', fg: 'var(--accent-web)' },
  descartado: { label: 'Descartado', bg: 'rgba(239,68,68,0.10)', fg: '#fca5a5' },
  contratado: { label: 'Contratado', bg: 'rgba(34,197,94,0.12)', fg: '#22c55e' },
};

const STATUS_FILTERS: Array<{ value: 'all' | App['status']; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'contactado', label: 'Contactadas' },
  { value: 'descartado', label: 'Descartadas' },
  { value: 'contratado', label: 'Contratadas' },
];

export default function ApplicationsTable({
  apps,
  offerOptions,
}: {
  apps: App[];
  offerOptions: Array<{ id: string; title: string }>;
}) {
  const [statusFilter, setStatusFilter] = useState<'all' | App['status']>('all');
  const [offerFilter, setOfferFilter] = useState<'all' | 'spontaneous' | string>('all');

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (offerFilter === 'spontaneous' && a.jobOfferId !== null) return false;
      if (offerFilter !== 'all' && offerFilter !== 'spontaneous' && a.jobOfferId !== offerFilter) {
        return false;
      }
      return true;
    });
  }, [apps, statusFilter, offerFilter]);

  const fmt = (ms: number | null) =>
    ms
      ? new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(ms))
      : '—';

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
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
        {offerOptions.length > 0 && (
          <select
            value={offerFilter}
            onChange={(e) => setOfferFilter(e.target.value)}
            className="rounded-full border bg-transparent px-3.5 py-1.5 text-xs text-white/85"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <option value="all" style={{ background: 'var(--bg-elevated)' }}>
              Todas las ofertas
            </option>
            <option value="spontaneous" style={{ background: 'var(--bg-elevated)' }}>
              Espontáneas
            </option>
            {offerOptions.map((o) => (
              <option key={o.id} value={o.id} style={{ background: 'var(--bg-elevated)' }}>
                {o.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[10px] uppercase tracking-wider text-white/40" style={{ borderColor: 'var(--border-subtle)' }}>
              <th className="px-5 py-3.5">Candidato</th>
              <th className="px-5 py-3.5">Oferta</th>
              <th className="px-5 py-3.5">Ciudad</th>
              <th className="px-5 py-3.5">Recibida</th>
              <th className="px-5 py-3.5">Estado</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {filtered.map((a) => {
              const badge = STATUS_BADGE[a.status];
              return (
                <tr key={a.id} className="transition-colors hover:bg-white/5">
                  <td className="px-5 py-4">
                    <div className="text-white">{a.fullName}</div>
                    <div className="truncate text-[11px] text-white/45">{a.email}</div>
                  </td>
                  <td className="px-5 py-4 text-white/85">
                    {a.offerTitle ?? <span className="italic text-white/45">Espontánea</span>}
                  </td>
                  <td className="px-5 py-4 text-white/65">{a.city}</td>
                  <td className="px-5 py-4 text-white/55">{fmt(a.createdAtMs)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: badge.bg, color: badge.fg }}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/trabajo/candidaturas/${a.id}`} className="text-xs text-white/65 hover:text-white link-underline">
                      Ver →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-white/45">Sin candidaturas en este filtro.</div>
        )}
      </div>
    </>
  );
}
