'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, CheckCircle2, Percent, BarChart3, Download, ChevronRight } from 'lucide-react';

import type { AttemptRow, ModuleAnalysis } from './page';

type Kpis = { totalAttempts: number; passedCount: number; passRate: number; avgPct: number };
type Tab = 'intentos' | 'analisis';
type SortKey = 'date' | 'name' | 'score';

function fmtDate(ms: number | null): string {
  if (!ms) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(ms));
}

function rateColor(rate: number | null): string {
  if (rate === null) return '#6b7280';
  if (rate >= 70) return '#10B981';
  if (rate >= 40) return '#F59E0B';
  return '#EF4444';
}

export default function NotasClient({
  attempts, analysis, kpis,
}: { attempts: AttemptRow[]; analysis: ModuleAnalysis[]; kpis: Kpis }) {
  const [tab, setTab] = useState<Tab>('intentos');

  return (
    <div className="mt-8">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Users size={18} />} value={kpis.totalAttempts} label="Intentos totales" color="var(--purple-300)" />
        <Kpi icon={<CheckCircle2 size={18} />} value={kpis.passedCount} label="Aprobados" color="#10B981" />
        <Kpi icon={<Percent size={18} />} value={`${kpis.passRate}%`} label="Tasa de aprobado" color="var(--accent-shop)" />
        <Kpi icon={<BarChart3 size={18} />} value={`${kpis.avgPct}%`} label="Nota media" color="var(--accent-web)" />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-2 border-b border-white/10">
        <TabButton active={tab === 'intentos'} onClick={() => setTab('intentos')}>Intentos</TabButton>
        <TabButton active={tab === 'analisis'} onClick={() => setTab('analisis')}>Análisis por pregunta</TabButton>
      </div>

      <div className="mt-6">
        {tab === 'intentos' ? <Intentos attempts={attempts} /> : <Analisis analysis={analysis} />}
      </div>
    </div>
  );
}

function Kpi({ icon, value, label, color }: { icon: React.ReactNode; value: React.ReactNode; label: string; color: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}1A`, border: `1px solid ${color}40`, color }}>
        {icon}
      </div>
      <div className="font-display text-3xl text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-white/50">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        'relative px-4 py-2.5 text-sm font-medium transition-colors',
        active ? 'text-white' : 'text-white/50 hover:text-white/80',
      ].join(' ')}
    >
      {children}
      {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full" style={{ background: 'var(--grad-signature)' }} />}
    </button>
  );
}

function Intentos({ attempts }: { attempts: AttemptRow[] }) {
  const [sort, setSort] = useState<SortKey>('date');

  const sorted = useMemo(() => {
    const a = [...attempts];
    if (sort === 'date') a.sort((x, y) => (y.finishedAt ?? 0) - (x.finishedAt ?? 0));
    if (sort === 'name') a.sort((x, y) => (x.name ?? '').localeCompare(y.name ?? ''));
    if (sort === 'score') a.sort((x, y) => pct(y) - pct(x));
    return a;
  }, [attempts, sort]);

  const downloadCsv = () => {
    const head = ['Comercial', 'Telefono', 'Fecha', 'Aciertos', 'Total', 'Porcentaje', 'Resultado'];
    const rows = attempts.map((a) => [
      a.name ?? '',
      a.phone ?? '',
      a.finishedAt ? new Date(a.finishedAt).toISOString() : '',
      String(a.score ?? ''),
      String(a.total ?? ''),
      `${pct(a)}%`,
      a.passed ? 'Aprobado' : 'No superado',
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `examenes-latech.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (attempts.length === 0) {
    return <Empty>Aún no hay intentos de examen registrados.</Empty>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-white/50">
          Ordenar por:
          {(['date', 'score', 'name'] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={['rounded-full px-3 py-1 transition-colors', sort === k ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'].join(' ')}
            >
              {k === 'date' ? 'Fecha' : k === 'score' ? 'Nota' : 'Nombre'}
            </button>
          ))}
        </div>
        <button
          onClick={downloadCsv}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/85 transition-colors hover:border-white/35"
        >
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Tabla (desktop) / tarjetas (móvil) */}
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="hidden grid-cols-[1.4fr_1fr_1.2fr_0.8fr_0.9fr_2.2rem] gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/40 md:grid">
          <span>Comercial</span><span>Teléfono</span><span>Fecha</span><span>Nota</span><span>Resultado</span><span />
        </div>
        {sorted.map((a) => (
          <Link
            key={a.id}
            href={`/admin/notas/${a.id}`}
            className="flex flex-col gap-1 border-b border-white/5 px-4 py-3 transition-colors last:border-0 hover:bg-white/[0.03] md:grid md:grid-cols-[1.4fr_1fr_1.2fr_0.8fr_0.9fr_2.2rem] md:items-center md:gap-2"
          >
            <span className="font-medium text-white">{a.name || '—'}</span>
            <span className="text-sm text-white/60">{a.phone || '—'}</span>
            <span className="text-sm text-white/60">{fmtDate(a.finishedAt)}</span>
            <span className="text-sm font-semibold text-white">{a.score}/{a.total} <span className="text-white/40">({pct(a)}%)</span></span>
            <span>
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={a.passed
                  ? { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }
                  : { background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                {a.passed ? 'Aprobado' : 'No superado'}
              </span>
            </span>
            <ChevronRight size={16} className="hidden justify-self-end text-white/30 md:block" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function Analisis({ analysis }: { analysis: ModuleAnalysis[] }) {
  const anyData = analysis.some((m) => m.questions.some((q) => q.answered > 0));
  if (!anyData) {
    return <Empty>Aún no hay respuestas registradas. El análisis aparecerá cuando los comerciales hagan el examen.</Empty>;
  }

  return (
    <div className="space-y-8">
      {analysis.map((m) => {
        // Dentro del módulo, las más falladas primero (las que tienen datos).
        const qs = [...m.questions].sort((a, b) => {
          if (a.correctRate === null) return 1;
          if (b.correctRate === null) return -1;
          return a.correctRate - b.correctRate;
        });
        return (
          <div key={m.moduleId}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/45">
              Módulo {m.order} · {m.title}
            </h3>
            <div className="mt-3 space-y-2">
              {qs.map((q) => (
                <div key={q.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-white/85">{q.prompt}</p>
                    <span className="shrink-0 text-sm font-bold tabular-nums" style={{ color: rateColor(q.correctRate) }}>
                      {q.correctRate === null ? '—' : `${q.correctRate}%`}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full transition-all" style={{ width: `${q.correctRate ?? 0}%`, background: rateColor(q.correctRate) }} />
                    </div>
                    <span className="shrink-0 text-[11px] text-white/45">
                      {q.answered === 0 ? 'Sin datos' : `${q.correct}/${q.answered} aciertos`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center text-sm text-white/45">
      {children}
    </div>
  );
}

function pct(a: AttemptRow): number {
  return a.total ? Math.round(((a.score ?? 0) / a.total) * 100) : 0;
}
