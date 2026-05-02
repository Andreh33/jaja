import Link from 'next/link';
import { Briefcase, Mail, Clock, ArrowRight } from 'lucide-react';
import Holographic from '@/components/effects/Holographic';
import { listApplicationsWithOffer, getJobMetrics } from '@/lib/admin-jobs';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<
  string,
  { label: string; bg: string; fg: string }
> = {
  pendiente: { label: 'Pendiente', bg: 'rgba(234,179,8,0.12)', fg: '#eab308' },
  contactado: { label: 'Contactado', bg: 'rgba(59,130,246,0.12)', fg: 'var(--accent-web)' },
  descartado: { label: 'Descartado', bg: 'rgba(239,68,68,0.10)', fg: '#fca5a5' },
  contratado: { label: 'Contratado', bg: 'rgba(34,197,94,0.12)', fg: '#22c55e' },
};

export default async function AdminTrabajoHome() {
  const [metrics, recent] = await Promise.all([
    getJobMetrics(),
    listApplicationsWithOffer().then((r) => r.slice(0, 5)),
  ]);

  return (
    <div className="px-6 py-8 md:px-10 md:py-12">
      <h1 className="font-display text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
        Trabajo
      </h1>
      <p className="mt-2 text-sm text-white/55">Ofertas de empleo y candidaturas recibidas.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Holographic className="p-6" rounded="rounded-2xl">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.30)', color: 'var(--accent-calc)' }}>
            <Briefcase size={18} strokeWidth={1.6} />
          </div>
          <div className="font-display text-3xl text-white">{metrics.activeOffers}</div>
          <div className="mt-2 text-xs uppercase tracking-wider text-white/50">Ofertas publicadas</div>
        </Holographic>
        <Holographic className="p-6" rounded="rounded-2xl">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(234,179,8,0.10)', border: '1px solid rgba(234,179,8,0.30)', color: '#eab308' }}>
            <Clock size={18} strokeWidth={1.6} />
          </div>
          <div className="font-display text-3xl text-white">{metrics.pendingApplications}</div>
          <div className="mt-2 text-xs uppercase tracking-wider text-white/50">Candidaturas pendientes</div>
        </Holographic>
        <Holographic className="p-6" rounded="rounded-2xl">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.30)', color: 'var(--purple-300)' }}>
            <Mail size={18} strokeWidth={1.6} />
          </div>
          <div className="font-display text-3xl text-white">{metrics.applicationsLast30d}</div>
          <div className="mt-2 text-xs uppercase tracking-wider text-white/50">Candidaturas últimos 30 días</div>
        </Holographic>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl glass p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl text-white">Últimas candidaturas</h2>
            <Link href="/admin/trabajo/candidaturas" className="text-xs text-white/60 hover:text-white link-underline">Ver todas →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-white/50">Sin candidaturas todavía.</p>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {recent.map((a) => {
                const badge = STATUS_BADGE[a.status] ?? STATUS_BADGE.pendiente;
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white">{a.fullName}</div>
                      <div className="truncate text-xs text-white/45">
                        {a.offerTitle ?? 'Espontánea'} · {a.createdAt ? formatDate(a.createdAt) : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ background: badge.bg, color: badge.fg }}>{badge.label}</span>
                      <Link href={`/admin/trabajo/candidaturas/${a.id}`} className="text-xs text-white/60 hover:text-white">
                        Ver →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl glass p-6">
          <h2 className="font-display text-xl text-white">Acciones rápidas</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href="/admin/trabajo/ofertas/nueva" className="group flex items-center gap-3 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10">
              <Briefcase size={18} className="text-amber-300" />
              <span className="text-sm text-white">Crear nueva oferta</span>
              <ArrowRight size={14} className="ml-auto text-white/40" />
            </Link>
            <Link href="/admin/trabajo/ofertas" className="group flex items-center gap-3 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10">
              <Briefcase size={18} className="text-white/60" />
              <span className="text-sm text-white">Gestionar ofertas</span>
              <ArrowRight size={14} className="ml-auto text-white/40" />
            </Link>
            <Link href="/admin/trabajo/candidaturas" className="group flex items-center gap-3 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 sm:col-span-2">
              <Mail size={18} className="text-purple-300" />
              <span className="text-sm text-white">Ver todas las candidaturas</span>
              <ArrowRight size={14} className="ml-auto text-white/40" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
