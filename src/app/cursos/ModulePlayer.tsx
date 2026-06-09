'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileDown, ArrowRight, Lock } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  moduleId: string;
  videoUrl: string;
  pdfUrl: string;
  durationSeconds: number;
  initialWatched: number;
  initialCompleted: boolean;
  nextModuleId: string | null;
  isLast: boolean;
};

const SEEK_TOLERANCE = 1.5;     // s de margen antes de considerar "adelantar"
const SAVE_INTERVAL_MS = 10000; // autosave cada 10 s de reproducción
const COMPLETE_RATIO = 0.95;    // marcar completado al 95% reproducido

export default function ModulePlayer({
  moduleId, videoUrl, pdfUrl, durationSeconds,
  initialWatched, initialCompleted, nextModuleId, isLast,
}: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Punto máximo alcanzado de forma legítima (límite del seek hacia delante).
  const allowedRef = useRef(initialCompleted ? Number.MAX_SAFE_INTEGER : initialWatched);
  const correctingRef = useRef(false);
  const lastSaveRef = useRef(0);
  const lastToastRef = useRef(0);
  const savedWatchedRef = useRef(initialWatched);

  const [completed, setCompleted] = useState(initialCompleted);
  const [pct, setPct] = useState(0);

  const save = useCallback(
    async (watched: number, markComplete: boolean, useBeacon = false) => {
      const watchedSeconds = Math.min(Math.floor(watched), durationSeconds || Math.floor(watched));
      if (!markComplete && watchedSeconds <= savedWatchedRef.current) return;
      savedWatchedRef.current = Math.max(savedWatchedRef.current, watchedSeconds);
      const body = JSON.stringify({ moduleId, watchedSeconds, completed: markComplete });
      try {
        if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon('/api/cursos/progress', new Blob([body], { type: 'application/json' }));
          return;
        }
        const r = await fetch('/api/cursos/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        });
        const data = await r.json().catch(() => ({}));
        if (data?.completed && !completed) {
          setCompleted(true);
          toast.success('¡Módulo completado! 🎉');
          router.refresh();
        }
      } catch {
        /* best-effort */
      }
    },
    [moduleId, durationSeconds, completed, router],
  );

  const markComplete = useCallback(
    (watched: number) => {
      if (completed) return;
      allowedRef.current = Number.MAX_SAFE_INTEGER;
      save(watched, true);
    },
    [completed, save],
  );

  // Reanudar donde se quedó.
  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!completed && initialWatched > 2 && initialWatched < v.duration - 2) {
      correctingRef.current = true;
      v.currentTime = initialWatched;
    }
  };

  const onSeeking = () => {
    const v = videoRef.current;
    if (!v) return;
    if (correctingRef.current) { correctingRef.current = false; return; }
    if (v.currentTime > allowedRef.current + SEEK_TOLERANCE) {
      correctingRef.current = true;
      v.currentTime = allowedRef.current;
      const now = Date.now();
      if (now - lastToastRef.current > 2500) {
        lastToastRef.current = now;
        toast('No puedes adelantar el vídeo. Debes verlo para avanzar.', { icon: '🔒' });
      }
    }
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || v.seeking) return;
    if (!completed) allowedRef.current = Math.max(allowedRef.current, v.currentTime);

    if (durationSeconds > 0) {
      setPct(Math.min(100, Math.round((v.currentTime / durationSeconds) * 100)));
      if (!completed && v.currentTime >= durationSeconds * COMPLETE_RATIO) {
        markComplete(v.currentTime);
      }
    }
    const now = Date.now();
    if (now - lastSaveRef.current > SAVE_INTERVAL_MS) {
      lastSaveRef.current = now;
      save(allowedRef.current, false);
    }
  };

  const onPause = () => { const v = videoRef.current; if (v) save(allowedRef.current, false); };
  const onEnded = () => { const v = videoRef.current; if (v) markComplete(v.duration || durationSeconds); };

  // Guardado best-effort al salir de la página.
  useEffect(() => {
    const handler = () => save(allowedRef.current, false, true);
    window.addEventListener('pagehide', handler);
    return () => {
      window.removeEventListener('pagehide', handler);
      save(allowedRef.current, false, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-5">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            onLoadedMetadata={onLoadedMetadata}
            onSeeking={onSeeking}
            onTimeUpdate={onTimeUpdate}
            onPause={onPause}
            onEnded={onEnded}
            className="aspect-video w-full bg-black"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center text-sm text-white/40">
            Vídeo no disponible
          </div>
        )}
      </div>

      {/* Progreso de visionado */}
      {!completed && (
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-purple-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs tabular-nums text-white/45">{pct}%</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-white/35"><Lock size={11} /> avance bloqueado</span>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/85 transition-colors hover:border-white/35 hover:text-white"
          >
            <FileDown size={16} /> Descargar PDF del módulo
          </a>
        ) : <span />}

        {completed ? (
          <Link
            href={isLast ? '/cursos' : `/cursos/${nextModuleId}`}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] glow-purple"
            style={{ background: 'var(--grad-signature)' }}
          >
            {isLast ? 'Ya puedes hacer el examen' : 'Siguiente módulo'} <ArrowRight size={16} />
          </Link>
        ) : null}
      </div>

      {completed && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.07] px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 size={18} /> Has completado este módulo. Ya tienes desbloqueado el siguiente paso.
        </div>
      )}
    </div>
  );
}
