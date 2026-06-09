import Link from 'next/link';
import { CheckCircle2, Lock, PlayCircle, ClipboardCheck, GraduationCap } from 'lucide-react';
import { getCommercialId } from '@/lib/curso-auth';
import { getCourseState, getCommercialName, type ModuleWithState } from '@/lib/curso';
import CursoLogin from './CursoLogin';
import LogoutButton from './_components/LogoutButton';

export const dynamic = 'force-dynamic';

function fmt(seconds: number | null): string {
  const s = Math.max(0, Math.round(seconds ?? 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export default async function CursosPage() {
  const commercialId = await getCommercialId();
  if (!commercialId) return <CursoLogin />;

  const [{ modules, examUnlocked, completedCount }, name] = await Promise.all([
    getCourseState(commercialId),
    getCommercialName(commercialId),
  ]);

  const firstName = (name || '').trim().split(' ')[0] || 'comercial';

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/45">Hola, {firstName} 👋</p>
          <h1 className="font-display mt-1 text-3xl text-white md:text-4xl" style={{ letterSpacing: '-0.03em', fontWeight: 800 }}>
            Tu formación
          </h1>
        </div>
        <div className="mt-1 text-right">
          <div className="text-2xl font-bold text-white">{completedCount}<span className="text-white/55">/{modules.length}</span></div>
          <div className="text-[11px] uppercase tracking-wider text-white/55">completados</div>
          <div className="mt-1"><LogoutButton /></div>
        </div>
      </div>

      {/* Barra de progreso global */}
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(completedCount / modules.length) * 100}%`, background: 'var(--grad-signature)' }}
        />
      </div>

      <ol className="mt-8 space-y-3">
        {modules.map((m) => (
          <ModuleCard key={m.id} m={m} />
        ))}
      </ol>

      {/* Examen final */}
      <ExamCard unlocked={examUnlocked} total={modules.length} completed={completedCount} />
    </div>
  );
}

function ModuleCard({ m }: { m: ModuleWithState }) {
  const inProgress = !m.completed && m.watchedSeconds > 0;
  const pct = m.durationSeconds ? Math.min(100, Math.round((m.watchedSeconds / m.durationSeconds) * 100)) : 0;

  const inner = (
    <div
      className={[
        'flex items-center gap-4 rounded-2xl border p-4 transition-all',
        m.unlocked ? 'glass border-white/10 hover:border-white/25' : 'border-white/5 bg-white/[0.02] opacity-60',
      ].join(' ')}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
        style={{
          background: m.completed
            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
            : m.unlocked
              ? 'var(--grad-signature)'
              : 'rgba(255,255,255,0.06)',
        }}
      >
        {m.completed ? <CheckCircle2 size={20} /> : m.unlocked ? <PlayCircle size={20} /> : <Lock size={18} className="text-white/55" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/55">Módulo {m.order}</span>
          {m.completed && <span className="text-[11px] font-semibold text-emerald-400">Completado</span>}
          {inProgress && <span className="text-[11px] font-semibold text-purple-300">En curso · {pct}%</span>}
        </div>
        <h3 className="truncate text-sm font-semibold text-white md:text-base">{m.title}</h3>
        <p className="mt-0.5 line-clamp-1 text-xs text-white/45">{m.description}</p>
        {inProgress && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-purple-400" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>

      <div className="shrink-0 text-right">
        <div className="text-xs text-white/55">{fmt(m.durationSeconds)}</div>
        {!m.unlocked && <div className="mt-1 text-[10px] uppercase tracking-wider text-white/50">Bloqueado</div>}
      </div>
    </div>
  );

  if (!m.unlocked) {
    return (
      <li className="cursor-not-allowed" title="Completa el módulo anterior para desbloquearlo">
        <div aria-disabled="true">{inner}</div>
      </li>
    );
  }
  return (
    <li>
      <Link href={`/cursos/${m.id}`} className="block">{inner}</Link>
    </li>
  );
}

function ExamCard({ unlocked, total, completed }: { unlocked: boolean; total: number; completed: number }) {
  const inner = (
    <div
      className={[
        'mt-6 flex items-center gap-4 rounded-2xl border p-5 transition-all',
        unlocked ? 'border-emerald-400/30 bg-emerald-500/[0.06] hover:border-emerald-400/60' : 'border-white/5 bg-white/[0.02] opacity-70',
      ].join(' ')}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ background: unlocked ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'rgba(255,255,255,0.06)' }}
      >
        {unlocked ? <ClipboardCheck size={22} /> : <Lock size={18} className="text-white/55" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <GraduationCap size={14} className="text-white/50" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/55">Examen final</span>
        </div>
        <h3 className="text-sm font-semibold text-white md:text-base">Examen teórico del curso</h3>
        <p className="mt-0.5 text-xs text-white/45">
          {unlocked
            ? 'Ya puedes presentarte. ¡Mucha suerte!'
            : `Completa los ${total} módulos para desbloquearlo (${completed}/${total}).`}
        </p>
      </div>
    </div>
  );

  if (!unlocked) return <div aria-disabled className="cursor-not-allowed">{inner}</div>;
  return <Link href="/cursos/examen" className="block">{inner}</Link>;
}
