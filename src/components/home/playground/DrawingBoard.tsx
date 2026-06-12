'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Eraser } from 'lucide-react';

const COLORS = ['#8B5CF6', '#C084FC', '#F97316', '#FBBF24', '#3B82F6', '#10B981', '#FF4D9D', '#FFFFFF'];
const SIZES = [3, 6, 12];

// Cursor de lápiz: SVG inline con el hotspot en la punta.
const PENCIL_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z' fill='%23FBBF24' stroke='%2307050E'/></svg>`
)}") 2 24, crosshair`;

export default function DrawingBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // El dibujo vive en un canvas offscreen a resolución fija: sobrevive a
  // resizes y al DPR sin emborronarse al reescalar.
  const boardRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [hasInk, setHasInk] = useState(false);

  const colorRef = useRef(color);
  const sizeRef = useRef(size);
  colorRef.current = color;
  sizeRef.current = size;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const board = document.createElement('canvas');
    board.width = 1600;
    board.height = 1000;
    boardRef.current = board;

    const paint = () => {
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(board, 0, 0, canvas.width, canvas.height);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      paint();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const toBoard = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * board.width,
        y: ((e.clientY - rect.top) / rect.height) * board.height,
      };
    };

    const down = (e: PointerEvent) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      drawing.current = true;
      last.current = toBoard(e);
      setHasInk(true);
    };
    const move = (e: PointerEvent) => {
      if (!drawing.current || !last.current) return;
      const p = toBoard(e);
      const ctx = board.getContext('2d')!;
      const scale = board.width / canvas.getBoundingClientRect().width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = sizeRef.current * scale;
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      // Punto medio para suavizar el trazo.
      const mx = (last.current.x + p.x) / 2;
      const my = (last.current.y + p.y) / 2;
      ctx.quadraticCurveTo(last.current.x, last.current.y, mx, my);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last.current = p;
      paint();
    };
    const up = () => {
      drawing.current = false;
      last.current = null;
    };

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointerleave', up);
    return () => {
      ro.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointerleave', up);
    };
  }, []);

  const clear = () => {
    const board = boardRef.current;
    const canvas = canvasRef.current;
    if (!board || !canvas) return;
    board.getContext('2d')!.clearRect(0, 0, board.width, board.height);
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  };

  const download = () => {
    const board = boardRef.current;
    if (!board) return;
    // Fondo oscuro de marca para que el PNG no salga transparente.
    const out = document.createElement('canvas');
    out.width = board.width;
    out.height = board.height;
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = '#0B0716';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(board, 0, 0);
    const a = document.createElement('a');
    a.download = 'mi-obra-latech.png';
    a.href = out.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className="relative flex-1 overflow-hidden rounded-2xl"
        style={{ background: 'rgba(7,5,14,0.55)', border: '1px solid var(--border-subtle)' }}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ cursor: PENCIL_CURSOR, touchAction: 'none' }}
          aria-label="Pizarra para dibujar libremente"
        />
        {!hasInk && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-white/30">
            Dibuja aquí lo que quieras ✏️
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              className="h-6 w-6 rounded-full transition-transform hover:scale-110"
              style={{
                background: c,
                boxShadow: color === c ? `0 0 0 2px var(--bg-base), 0 0 0 4px ${c}` : 'none',
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              aria-label={`Grosor ${s}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              style={{
                background: size === s ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
                border: `1px solid ${size === s ? 'var(--border-glow)' : 'var(--border-subtle)'}`,
              }}
            >
              <span className="rounded-full bg-white" style={{ width: s + 2, height: s + 2 }} />
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={clear}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-white/70 transition-colors hover:text-white"
            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}
          >
            <Eraser size={13} /> Borrar
          </button>
          <button
            onClick={download}
            disabled={!hasInk}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-white/70 transition-colors hover:text-white disabled:opacity-40"
            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}
          >
            <Download size={13} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
