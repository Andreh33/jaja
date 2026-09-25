'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Download, Eraser, Undo2, Redo2 } from 'lucide-react';

type Point = { x: number; y: number };
type Stroke = { color: string; size: number; points: Point[] };
const COLORS = [{ hex: '#3b82f6', name: 'Azul eléctrico' }, { hex: '#93c5fd', name: 'Azul cielo' }, { hex: '#b9e7ff', name: 'Azul hielo' }, { hex: '#ffffff', name: 'Blanco' }];
const WIDTH = 1200, HEIGHT = 720;

function paint(canvas: HTMLCanvasElement | null, strokes: Stroke[]) {
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  for (const stroke of strokes) {
    if (!stroke.points.length) continue;
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const first = stroke.points[0];
    if (stroke.points.length === 1) {
      ctx.beginPath(); ctx.arc(first.x, first.y, stroke.size / 2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(first.x, first.y);
      for (const p of stroke.points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }
}

export default function DrawingBoard() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const undone = useRef<Stroke[]>([]);
  const active = useRef<number | null>(null);
  const [color, setColor] = useState(COLORS[0].hex);
  const [size, setSize] = useState(8);
  const [counts, setCounts] = useState({ ink: 0, undo: 0 });
  useEffect(() => { paint(canvas.current, strokes.current); }, []);

  const point = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width * WIDTH, y: (e.clientY - rect.top) / rect.height * HEIGHT };
  };
  const sync = () => { paint(canvas.current, strokes.current); setCounts({ ink: strokes.current.length, undo: undone.current.length }); };
  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!e.isPrimary || e.button !== 0 || active.current !== null) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    active.current = e.pointerId;
    undone.current = [];
    // Keep a bounded history; the canvas itself never resizes, so artwork survives rotation.
    if (strokes.current.length >= 150) strokes.current.shift();
    strokes.current.push({ color, size, points: [point(e)] });
    sync();
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (active.current !== e.pointerId) return;
    const stroke = strokes.current.at(-1);
    if (stroke && stroke.points.length < 6000) { stroke.points.push(point(e)); paint(canvas.current, strokes.current); }
  };
  const up = (e: PointerEvent<HTMLCanvasElement>) => {
    if (active.current !== e.pointerId) return;
    active.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const undo = () => { const last = strokes.current.pop(); if (last) undone.current.push(last); sync(); };
  const redo = () => { const last = undone.current.pop(); if (last) strokes.current.push(last); sync(); };
  const clear = () => { strokes.current = []; undone.current = []; active.current = null; sync(); };
  const download = () => {
    if (!canvas.current) return;
    const output = document.createElement('canvas'); output.width = WIDTH; output.height = HEIGHT;
    const ctx = output.getContext('2d')!;
    ctx.fillStyle = '#071323'; ctx.fillRect(0, 0, WIDTH, HEIGHT); ctx.drawImage(canvas.current, 0, 0);
    const link = document.createElement('a'); link.download = 'mi-idea-latech.png'; link.href = output.toDataURL('image/png'); link.click();
  };

  return <div className="flex h-full min-h-0 flex-col gap-3" data-game="drawing" data-strokes={counts.ink}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1" role="group" aria-label="Color del lápiz">
        {COLORS.map(c => <button key={c.hex} onClick={() => setColor(c.hex)} aria-label={c.name} aria-pressed={color === c.hex} className="grid h-11 w-11 place-items-center rounded-lg border" style={{ borderColor: color === c.hex ? '#b9e7ff' : 'transparent' }}><span className="h-5 w-5 rounded-full" style={{ background: c.hex }} /></button>)}
      </div>
      <div className="flex items-center gap-1" role="group" aria-label="Grosor del lápiz">
        {[4, 8, 16].map(s => <button key={s} onClick={() => setSize(s)} aria-label={'Grosor ' + s} aria-pressed={size === s} className="grid h-11 w-11 place-items-center rounded-lg border" style={{ borderColor: size === s ? '#b9e7ff' : 'transparent' }}><span className="rounded-full bg-white" style={{ width: s, height: s }} /></button>)}
      </div>
    </div>
    <canvas ref={canvas} width={WIDTH} height={HEIGHT} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={() => { active.current = null; }} aria-label="Lienzo de dibujo libre. Usa el ratón, lápiz o un dedo." className="min-h-0 w-full flex-1 rounded-lg border border-blue-200/15 bg-[#071323]" style={{ cursor: 'crosshair', touchAction: 'none' }} />
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex gap-1">
        <button onClick={undo} disabled={!counts.ink} aria-label="Deshacer trazo" className="grid h-11 w-11 place-items-center rounded-lg bg-white/5 disabled:opacity-30"><Undo2 size={17} /></button>
        <button onClick={redo} disabled={!counts.undo} aria-label="Rehacer trazo" className="grid h-11 w-11 place-items-center rounded-lg bg-white/5 disabled:opacity-30"><Redo2 size={17} /></button>
        <button onClick={clear} disabled={!counts.ink} aria-label="Borrar lienzo" className="grid h-11 w-11 place-items-center rounded-lg bg-white/5 disabled:opacity-30"><Eraser size={17} /></button>
      </div>
      <button onClick={download} disabled={!counts.ink} className="flex min-h-11 items-center gap-2 rounded-lg bg-[#b9e7ff] px-3 text-xs font-semibold text-[#071323] disabled:opacity-30"><Download size={15} /> Guardar PNG</button>
    </div>
    <p className="text-center text-[11px] text-white/55">Tu idea, sin plugins. Dibuja, deshaz y llévatela.</p>
  </div>;
}
