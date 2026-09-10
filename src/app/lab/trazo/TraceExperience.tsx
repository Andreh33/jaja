'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Download, Pause, Play, RotateCcw, Share2 } from 'lucide-react';
import { createGameSession, PAUSE_LABELS, suspendGames, type GameSession, type PauseReason } from '@/components/home/playground/game-session';
import { decodeTraceLevel, generateTraceLevel, MAX_TRACE_POINTS, TRACE_PRESETS, type TraceLevel, type TracePoint } from '@/lib/trace-game/level';
import { newTraceRun, requestTraceJump, stepTraceRun } from '@/lib/trace-game/physics';
import { renderTrace, renderTraceCard } from '@/lib/trace-game/render';
import { trackLabGameStart, trackTraceEvent, trackSharedTraceOpen } from '@/lib/lab-analytics';
import styles from './trace.module.css';

function TracePlayer({ level, onEdit, onComplete }: { level: TraceLevel; onEdit: () => void; onComplete: (time: number) => void }) {
  const surface = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const progress = useRef<HTMLProgressElement>(null);
  const session = useRef<GameSession | null>(null);
  const commands = useRef({ start: () => {}, jump: () => {} });
  const [state, setState] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready');
  const [pauseReasons, setPauseReasons] = useState<PauseReason[]>([]);
  const [time, setTime] = useState(0);
  const reduced = useReducedMotion();
  const preferences = useRef({ reduced: !!reduced, onComplete });
  useEffect(() => { preferences.current = { reduced: !!reduced, onComplete }; }, [reduced, onComplete]);

  useEffect(() => {
    const element = surface.current!;
    const view = canvas.current!;
    const ctx = view.getContext('2d')!;
    let run = newTraceRun(level);
    let started = false;
    let width = 0, height = 0;
    const draw = () => renderTrace(ctx, width, height, level, run, !started, preferences.current.reduced);
    const resize = () => {
      const rect = view.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      view.width = Math.round(width * dpr); view.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
    };
    const controller = createGameSession({ element, onPause: setPauseReasons, onFrame: (_time, dt) => {
      if (started) {
        stepTraceRun(run, level, dt);
        if (progress.current) progress.current.value = Math.min(100, run.x / level.finish * 100);
        if (run.status !== 'playing') { controller.stop(); setState(run.status); setTime(run.time); if (run.status === 'won') preferences.current.onComplete(run.time); }
      }
      draw();
    } });
    session.current = controller;
    commands.current = {
      start: () => { trackLabGameStart('trazo'); run = newTraceRun(level); started = true; setState('playing'); view.focus({ preventScroll: true }); controller.play(); },
      jump: () => { if (controller.canPlay()) requestTraceJump(run); },
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.target !== view) return;
      if (event.code === 'KeyP' || event.code === 'Escape') { event.preventDefault(); controller.pause(); }
      else if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') { event.preventDefault(); if (!event.repeat) commands.current.jump(); }
    };
    const onPointer = (event: PointerEvent) => { if (event.button !== 0) return; event.preventDefault(); view.focus({ preventScroll: true }); commands.current.jump(); };
    view.addEventListener('keydown', onKey); view.addEventListener('pointerdown', onPointer);
    const observer = new ResizeObserver(resize); observer.observe(view); resize();
    return () => { controller.dispose(); session.current = null; observer.disconnect(); view.removeEventListener('keydown', onKey); view.removeEventListener('pointerdown', onPointer); };
  }, [level]);

  const paused = state === 'playing' && pauseReasons.length > 0;
  return <div ref={surface} className={styles.player}>
    <div className={styles.gameHeader}><span>Tu recorrido <span aria-hidden>↗</span></span><button type="button" className={styles.smallButton} onClick={onEdit}><ArrowLeft size={15} /> Editar trazo</button></div>
    <div className={styles.scene}>
      <canvas ref={canvas} className={styles.gameCanvas} tabIndex={state === 'playing' && !paused ? 0 : -1} aria-label="Tu trazo jugable. Espacio, flecha arriba o W: saltar. P o Escape: pausar." />
      {(state !== 'playing' || paused) && <div className={styles.gameOverlay}>
        <span className={styles.eyebrow}>{state === 'won' ? 'Tu imaginación ya es un mundo' : state === 'lost' ? 'El mismo trazo. Otra oportunidad.' : paused ? 'Un respiro' : 'Tu nivel está listo'}</span>
        <h2>{state === 'won' ? '¡Llegaste!' : state === 'lost' ? 'Casi lo tienes.' : paused ? 'Partida en pausa.' : 'De tu mano al juego.'}</h2>
        <p>{state === 'won' ? `Has cruzado tu mundo en ${time.toFixed(1)} segundos. Descarga la tarjeta o comparte el enlace de abajo.` : state === 'lost' ? 'Salta cerca del borde para alcanzar la siguiente plataforma. Reintenta el mismo recorrido.' : paused ? PAUSE_LABELS[pauseReasons[0]] : 'Avanza solo. Pulsa espacio o toca para saltar entre plataformas y llegar a la bandera. Unos 20 segundos, si llegas a la primera.'}</p>
        <button type="button" className={styles.primary} onClick={() => {
          if (paused) { canvas.current?.focus({ preventScroll: true }); session.current?.play(); }
          else commands.current.start();
        }}>{state === 'lost' || state === 'won' ? <RotateCcw size={17} /> : <Play size={17} />}{paused ? 'Reanudar' : state === 'ready' ? 'Jugar mi trazo' : 'Jugar otra vez'}</button>
      </div>}
    </div>
    <div className={styles.progress}><span>Inicio</span><progress ref={progress} value={0} max={100} aria-label="Progreso hasta la bandera" /><span>Meta</span></div>
    <div className={styles.gameControls}>
      <button type="button" className={styles.primary} disabled={state !== 'playing' || paused} onClick={() => { canvas.current?.focus({ preventScroll: true }); commands.current.jump(); }}>Saltar <span>Espacio / ↑</span></button>
      <button type="button" className={styles.secondary} disabled={state !== 'playing' || paused} onClick={() => session.current?.pause()}><Pause size={16} /> Pausa</button>
    </div>
    <p className={styles.fine}>El juego se pausa al cambiar de pestaña, salir de esta zona o abrir otro experimento.</p>
  </div>;
}

export default function TraceExperience({ sharedToken }: { sharedToken?: string }) {
  const initial = sharedToken ? decodeTraceLevel(sharedToken) : null;
  const [points, setPoints] = useState<TracePoint[]>([]);
  const [level, setLevel] = useState<TraceLevel | null>(initial);
  const [message, setMessage] = useState(sharedToken && !initial ? 'Este enlace no contiene un recorrido compatible. Dibuja uno nuevo o elige una de las tres formas.' : initial ? 'Has abierto un recorrido compartido. Las plataformas son exactamente las mismas para todos.' : 'Dibuja una sola línea de izquierda a derecha.');
  const [sharedUrl, setSharedUrl] = useState('');
  const [completed, setCompleted] = useState<number | null>(null);
  const drawCanvas = useRef<HTMLCanvasElement>(null);
  const activePointer = useRef<number | null>(null);
  const recordedSharedOpen = useRef(false);
  useEffect(() => {
    if (sharedToken && !recordedSharedOpen.current) {
      recordedSharedOpen.current = true;
      trackSharedTraceOpen(!!decodeTraceLevel(sharedToken));
    }
  }, [sharedToken]);

  useEffect(() => {
    if (level) return;
    const canvas = drawCanvas.current!;
    const ctx = canvas.getContext('2d')!;
    const paint = () => {
      const rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      const gradient = ctx.createLinearGradient(0, 0, rect.width, 0); gradient.addColorStop(0, '#a78bfa'); gradient.addColorStop(.65, '#f97316'); gradient.addColorStop(1, '#fbbf24');
      ctx.strokeStyle = gradient; ctx.fillStyle = gradient; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (points.length) {
        const first = points[0]; ctx.beginPath(); ctx.arc(first.x * rect.width, first.y * rect.height, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); points.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x * rect.width, p.y * rect.height); else ctx.lineTo(p.x * rect.width, p.y * rect.height); }); ctx.stroke();
      }
    };
    const observer = new ResizeObserver(paint); observer.observe(canvas); paint();
    return () => observer.disconnect();
  }, [points, level]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): TracePoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
  };
  const finishPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setMessage('Tu línea está lista. Conviértela en un mundo o vuelve a dibujar.');
  };
  const selectPreset = (samples: readonly number[]) => { suspendGames(); setPoints(samples.map((y, i) => ({ x: i / (samples.length - 1), y: y / 31 }))); setMessage('Recorrido elegido. Puedes convertirlo o dibujar encima una nueva línea.'); };
  const create = () => {
    try { const generated = generateTraceLevel(points); trackTraceEvent('trace_created'); setLevel(generated); setCompleted(null); setSharedUrl(''); setMessage(generated.repaired ? 'Hemos suavizado desniveles y separado plataformas para que los saltos tengan una distancia alcanzable. La línea discontinua conserva el perfil de tu mundo.' : 'Hemos convertido tu línea en 16 tramos, con huecos y plataformas preparados para saltar.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Prueba otro recorrido.'); }
  };
  const share = async () => {
    if (!level) return;
    trackTraceEvent('trace_share_intent');
    const url = `${window.location.origin}/lab/trazo?level=${level.token}`;
    setSharedUrl(url);
    if (navigator.share) {
      try { await navigator.share({ title: 'Tu trazo, un mundo · Latech Lab', text: '¿Llegas hasta el final de mi recorrido?', url }); setMessage('Enlace compartido. El recorrido viaja en él, sin guardar tu dibujo en un servidor.'); return; }
      catch (error) { if (error instanceof Error && error.name === 'AbortError') { setMessage('Puedes copiar el enlace cuando quieras.'); return; } }
    }
    try { await navigator.clipboard.writeText(url); setMessage('Enlace copiado. Quien lo abra jugará exactamente este recorrido.'); }
    catch { setMessage('Copia el enlace que aparece debajo para compartir tu recorrido.'); }
  };
  const download = () => {
    if (!level) return;
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 630;
    const ctx = canvas.getContext('2d'); if (!ctx) { setMessage('No hemos podido crear la tarjeta en este navegador. Puedes compartir el enlace.'); return; }
    renderTraceCard(ctx, level, completed);
    canvas.toBlob((blob) => {
      if (!blob) { setMessage('No hemos podido descargar la tarjeta. Prueba el enlace.'); return; }
      const url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mi-mundo-latech.png'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage('Tarjeta descargada. Acompáñala con el enlace para que puedan jugar tu recorrido.');
    }, 'image/png');
  };

  return <div className={styles.experience}>
    <div className={styles.steps} aria-label="Pasos de la experiencia"><span aria-current={!level ? 'step' : undefined}>01 · Traza</span><span aria-current={level && completed === null ? 'step' : undefined}>02 · Juega</span><span aria-current={completed !== null ? 'step' : undefined}>03 · Comparte</span></div>
    {!level ? <section className={styles.editor} aria-labelledby="trace-draw-title">
      <div className={styles.editorTitle}><div><p className={styles.eyebrow}>El lápiz lo tienes tú</p><h2 id="trace-draw-title">Empieza con una línea.</h2></div><button type="button" className={styles.smallButton} disabled={!points.length} onClick={() => { setPoints([]); setMessage('Lienzo preparado. Dibuja una línea de izquierda a derecha.'); }}><RotateCcw size={15} /> Limpiar</button></div>
      <div className={styles.drawingArea}>
        <canvas ref={drawCanvas} aria-label="Dibuja una línea con ratón o dedo. También puedes elegir Olas, Cumbres o Escalera con los botones de abajo." className={styles.drawCanvas}
          onPointerDown={(event) => { if (event.button !== 0 || activePointer.current !== null) return; event.preventDefault(); suspendGames(); activePointer.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); setPoints([pointFromEvent(event)]); }}
          onPointerMove={(event) => { if (activePointer.current !== event.pointerId) return; const next = pointFromEvent(event); setPoints((current) => current.length >= MAX_TRACE_POINTS ? [...current.slice(0, -1), next] : [...current, next]); }}
          onPointerUp={finishPointer} onPointerCancel={finishPointer} onLostPointerCapture={finishPointer} />
        {!points.length && <p className={styles.drawHint}>Tu imaginación, nuestro límite.<span>Traza por aquí →</span></p>}
      </div>
      <div className={styles.presets}><span>O empieza con una forma:</span><div>{TRACE_PRESETS.map((preset) => <button type="button" className={styles.secondary} key={preset.id} onClick={() => selectPreset(preset.samples)}>{preset.name}</button>)}</div></div>
      <button type="button" className={styles.primary} disabled={points.length < 2} onClick={create}>Convertir en un mundo <ArrowUpRight size={18} /></button>
    </section> : <>
      <TracePlayer key={level.token} level={level} onEdit={() => { setPoints(level.samples.map((y, i) => ({ x: i / 15, y: y / 31 }))); setLevel(null); setCompleted(null); setMessage('Este es el perfil de tu recorrido. Elige otra forma o dibuja de nuevo.'); }} onComplete={(time) => { setCompleted(time); trackTraceEvent('trace_finish'); }} />
      <div className={styles.shareActions}><div><h3>Este mundo puede viajar.</h3><p>El enlace guarda solo la forma del nivel. No necesitas una cuenta.</p></div><button type="button" className={styles.secondary} onClick={download}><Download size={17} /> Tarjeta PNG</button><button type="button" className={styles.primary} onClick={share}><Share2 size={17} /> Compartir nivel</button></div>
      {sharedUrl && <label className={styles.shareLink}>Enlace al mismo recorrido<input value={sharedUrl} readOnly onFocus={(event) => event.currentTarget.select()} /></label>}
    </>}
    <p className={styles.status} role="status">{message}</p>
    <div id="trace-explanation" className={styles.explanation}><div><h3>Tu línea pone la idea.</h3><p>Convertimos su perfil en plataformas, suavizamos los saltos bruscos y limitamos las distancias. Los bucles se leen de izquierda a derecha. La destreza la pones tú.</p></div><div><h3>Sin publicar tu dibujo.</h3><p>Todo se genera en tu navegador. El enlace contiene 16 alturas y una versión de reglas. Descargar o compartir es siempre tu decisión.</p></div></div>
    <Link href="/tienda/calculadora" className={styles.project}>¿Una experiencia así para tu marca?<span>Da forma a tu proyecto <ArrowUpRight size={18} /></span></Link>
  </div>;
}
