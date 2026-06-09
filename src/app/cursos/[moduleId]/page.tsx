import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCommercialId } from '@/lib/curso-auth';
import { getModuleState } from '@/lib/curso';
import ModulePlayer from '../ModulePlayer';

export const dynamic = 'force-dynamic';

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const commercialId = await getCommercialId();
  if (!commercialId) redirect('/cursos');

  const { moduleId } = await params;
  const { state, current, index } = await getModuleState(commercialId, moduleId);

  // Módulo inexistente o bloqueado → de vuelta al índice (bloqueo secuencial real).
  if (!current || !current.unlocked) redirect('/cursos');

  const next = state.modules[index + 1];
  const isLast = index === state.modules.length - 1;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/cursos"
        className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
      >
        <ArrowLeft size={15} /> Todos los módulos
      </Link>

      <div className="mt-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Módulo {current.order}</span>
        <h1 className="font-display mt-1 text-2xl text-white md:text-3xl" style={{ letterSpacing: '-0.03em', fontWeight: 800 }}>
          {current.title}
        </h1>
        {current.description && <p className="mt-2 text-sm text-white/55">{current.description}</p>}
      </div>

      <ModulePlayer
        moduleId={current.id}
        videoUrl={current.videoUrl ?? ''}
        pdfUrl={current.pdfUrl ?? ''}
        durationSeconds={current.durationSeconds ?? 0}
        initialWatched={current.watchedSeconds}
        initialCompleted={current.completed}
        nextModuleId={next ? next.id : null}
        isLast={isLast}
      />
    </div>
  );
}
