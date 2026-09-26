'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { ArrowDown, Move, RotateCcw, Zap } from 'lucide-react';
import { createStudioBodies, stepStudioBodies, type StudioBody } from './studio-physics';
import styles from './HeroPreview.module.css';

export default function StudioGravity({ active }: { active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useInView(canvas);
  const reduced = useReducedMotion();
  const [gravity, setGravity] = useState(false);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState('Arrastra las piezas. El escenario es tuyo.');
  const bodies = useRef<StudioBody[]>([]);
  const frame = useRef<() => void>(() => {});
  const held = useRef(-1);
  const pointer = useRef<number | null>(null);
  const size = useRef({ width: 300, height: 300 });

  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext('2d');
    if (!element || !ctx) return;
    function draw() {
      const { width, height } = size.current;
      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = '#b0dcff16'; ctx!.lineWidth = 1;
      for (let x = 0; x < width; x += 30) { ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, height); ctx!.stroke(); }
      for (let y = 0; y < height; y += 30) { ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(width, y); ctx!.stroke(); }
      bodies.current.forEach((body, i) => {
        ctx!.save(); ctx!.translate(body.x, body.y); ctx!.rotate(body.angle);
        ctx!.fillStyle = ['#b9e2ff', '#0868d9', '#fff', '#ffac75'][i % 4];
        ctx!.beginPath(); ctx!.roundRect(-body.size * 1.65, -body.size * .75, body.size * 3.3, body.size * 1.5, i % 3 === 0 ? 50 : 5); ctx!.fill();
        ctx!.fillStyle = i % 4 === 1 ? '#fff' : '#10233b';
        ctx!.font = `700 ${body.label.length > 4 ? body.size * .43 : body.size * .58}px sans-serif`;
        ctx!.textAlign = 'center'; ctx!.textBaseline = 'middle'; ctx!.fillText(body.label, 0, 1); ctx!.restore();
      });
    }
    frame.current = draw;
    const observer = new ResizeObserver(() => {
      const width = element.clientWidth, height = element.clientHeight;
      if (width < 1 || height < 1) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = Math.round(width * dpr); element.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.current = { width, height }; bodies.current = createStudioBodies(width, height); draw();
    });
    observer.observe(element);
    return () => { observer.disconnect(); frame.current = () => {}; };
  }, []);

  useEffect(() => {
    if (!active || !visible || reduced || paused) return;
    let raf = 0, last = 0;
    function tick(now: number) {
      stepStudioBodies(bodies.current, size.current.width, size.current.height, last ? (now - last) / 1000 : 0, gravity, held.current);
      last = now; frame.current(); raf = requestAnimationFrame(tick);
    }
    function visibility() { cancelAnimationFrame(raf); last = 0; if (!document.hidden) raf = requestAnimationFrame(tick); }
    visibility(); document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', visibility); };
  }, [active, visible, reduced, paused, gravity]);

  return <div className={styles.gravityModule}>
    <div className={styles.gravityTop}><span>LAB / 01</span><span>{gravity ? 'GRAVEDAD TERRESTRE' : 'GRAVEDAD CERO'}</span></div>
    <canvas ref={canvas} className={styles.gravityCanvas} role="img" aria-label="Escenario de piezas de diseño. Puedes moverlas con el puntero o usar los controles inferiores."
      onPointerDown={event => {
        if (pointer.current !== null) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width * size.current.width;
        const y = (event.clientY - rect.top) / rect.height * size.current.height;
        const index = bodies.current.findLastIndex(b => Math.abs(b.x - x) < b.size * 1.8 && Math.abs(b.y - y) < b.size);
        if (index < 0) return;
        pointer.current = event.pointerId; held.current = index; event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        if (pointer.current !== event.pointerId || held.current < 0) return;
        const rect = event.currentTarget.getBoundingClientRect(), body = bodies.current[held.current];
        body.x = Math.max(body.size * 1.8, Math.min(size.current.width - body.size * 1.8, (event.clientX - rect.left) / rect.width * size.current.width));
        body.y = Math.max(body.size, Math.min(size.current.height - body.size, (event.clientY - rect.top) / rect.height * size.current.height));
        body.vx = 0; body.vy = 0; frame.current();
      }}
      onLostPointerCapture={() => { held.current = -1; pointer.current = null; }}
      onPointerUp={event => { held.current = -1; pointer.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
      onPointerCancel={() => { held.current = -1; pointer.current = null; }} />
    <div className={styles.labControls}>
      <button type="button" onClick={() => { bodies.current.forEach((body, i) => { body.vx = (i % 2 ? 1 : -1) * 100; body.vy = -110 - i * 10; if (reduced || paused) { body.angle += .3; body.y = size.current.height * (.2 + (i % 3) * .25); } }); frame.current(); setMessage('Impulso aplicado.'); }}><Zap size={14} /> Impulso</button>
      <button type="button" aria-pressed={gravity} onClick={() => { setGravity(value => !value); setMessage(gravity ? 'Gravedad cero.' : 'Gravedad activada.'); }}><ArrowDown size={14} /> Gravedad</button>
      <button type="button" onClick={() => { bodies.current = createStudioBodies(size.current.width, size.current.height); frame.current(); setMessage('Composición restaurada.'); }}><RotateCcw size={14} /> Recomponer</button>
      <button type="button" aria-pressed={paused || !!reduced} disabled={!!reduced} onClick={() => setPaused(value => !value)}><Move size={14} />{reduced ? 'Movimiento reducido' : paused ? 'Reanudar' : 'Pausar'}</button>
    </div>
    <p className={styles.note} role="status">{message}</p>
  </div>;
}
