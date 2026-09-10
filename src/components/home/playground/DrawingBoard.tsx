'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Eraser, Pencil, Redo2, Trash2, Undo2 } from 'lucide-react';
import { gameStorage } from './game-storage';
import { suspendGames } from './game-session';
import styles from './games.module.css';

const COLORS = [
  { value: '#8B5CF6', name: 'Violeta' }, { value: '#C084FC', name: 'Lavanda' },
  { value: '#F97316', name: 'Naranja' }, { value: '#FBBF24', name: 'Amarillo' },
  { value: '#3B82F6', name: 'Azul' }, { value: '#10B981', name: 'Verde' },
  { value: '#FF4D9D', name: 'Rosa' }, { value: '#FFFFFF', name: 'Blanco' },
];
const SIZES = [3, 6, 12];
const WIDTH = 1600;
const HEIGHT = 1000;
const STORAGE_KEY = 'latech-drawing-v1';
const MAX_OPERATIONS = 240;
const MAX_POINTS = 2048;
type Point = { x: number; y: number };
type Stroke = { kind: 'stroke'; color: string; size: number; erase: boolean; points: Point[] };
type Operation = Stroke | { kind: 'clear' };

function readDrawing(): Operation[] {
  try {
    const raw = gameStorage.getItem(STORAGE_KEY);
    if (!raw || raw.length > 2_000_000) return [];
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1
      || !('operations' in value) || !Array.isArray(value.operations) || value.operations.length > MAX_OPERATIONS) return [];
    const valid = value.operations.every((op: unknown) => {
      if (!op || typeof op !== 'object' || !('kind' in op)) return false;
      if (op.kind === 'clear') return true;
      if (op.kind !== 'stroke' || !('color' in op) || !COLORS.some((c) => c.value === op.color)
        || !('size' in op) || typeof op.size !== 'number' || op.size <= 0 || op.size > 200
        || !('erase' in op) || typeof op.erase !== 'boolean'
        || !('points' in op) || !Array.isArray(op.points) || !op.points.length || op.points.length > MAX_POINTS) return false;
      return op.points.every((p: unknown) => p && typeof p === 'object' && 'x' in p && 'y' in p
        && typeof p.x === 'number' && Number.isFinite(p.x) && p.x >= 0 && p.x <= WIDTH
        && typeof p.y === 'number' && Number.isFinite(p.y) && p.y >= 0 && p.y <= HEIGHT);
    });
    return valid ? value.operations as Operation[] : [];
  } catch { return []; }
}

function paintStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  ctx.save();
  ctx.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const first = stroke.points[0];
  ctx.beginPath();
  ctx.arc(first.x, first.y, stroke.size / 2, 0, Math.PI * 2);
  ctx.fill();
  if (stroke.points.length > 1) {
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (const p of stroke.points.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  ctx.restore();
}

export default function DrawingBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<HTMLCanvasElement | null>(null);
  const operations = useRef<Operation[]>([]);
  const redo = useRef<Operation[]>([]);
  const [color, setColor] = useState(COLORS[0].value);
  const [size, setSize] = useState(6);
  const [erase, setErase] = useState(false);
  const options = useRef({ color, size, erase });
  useEffect(() => { options.current = { color, size, erase }; }, [color, size, erase]);
  const [history, setHistory] = useState({ undo: 0, redo: 0 });
  const [status, setStatus] = useState('El dibujo se guarda solo en este dispositivo.');
  const commands = useRef({ undo: () => {}, redo: () => {}, clear: () => {} });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const board = document.createElement('canvas');
    board.width = WIDTH;
    board.height = HEIGHT;
    boardRef.current = board;
    const ctx = board.getContext('2d')!;
    let current: Stroke | null = null;
    let pointer: number | null = null;
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    let displayScale = 1;
    let offsetX = 0;
    let offsetY = 0;
    const keyboardPoint = { x: WIDTH / 2, y: HEIGHT / 2 };
    let keyboardMode = false;
    let keyboardInk = false;

    const paint = () => {
      const view = canvas.getContext('2d')!;
      view.clearRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(canvas.width / WIDTH, canvas.height / HEIGHT);
      view.drawImage(board, (canvas.width - WIDTH * scale) / 2, (canvas.height - HEIGHT * scale) / 2, WIDTH * scale, HEIGHT * scale);
      if (keyboardMode) {
        const x = (canvas.width - WIDTH * scale) / 2 + keyboardPoint.x * scale;
        const y = (canvas.height - HEIGHT * scale) / 2 + keyboardPoint.y * scale;
        view.strokeStyle = '#ffffff'; view.lineWidth = 1.5;
        view.beginPath(); view.arc(x, y, 7, 0, Math.PI * 2); view.moveTo(x - 11, y); view.lineTo(x + 11, y); view.moveTo(x, y - 11); view.lineTo(x, y + 11); view.stroke();
      }
    };
    const redraw = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      for (const op of operations.current) {
        if (op.kind === 'clear') ctx.clearRect(0, 0, WIDTH, HEIGHT);
        else paintStroke(ctx, op);
      }
      paint();
    };
    const persist = () => {
      clearTimeout(saveTimer);
      const data = JSON.stringify({ version: 1, operations: operations.current });
      const saved = data.length <= 2_000_000 && gameStorage.setItem(STORAGE_KEY, data);
      setStatus(saved ? 'Guardado en este dispositivo.' : 'No se pudo guardar aquí. Descarga tu dibujo para conservarlo.');
    };
    const changed = () => {
      setHistory({ undo: operations.current.length, redo: redo.current.length });
      clearTimeout(saveTimer);
      saveTimer = setTimeout(persist, 400);
    };
    const finish = () => {
      keyboardInk = false;
      if (!current) return;
      operations.current.push(current);
      redo.current = [];
      current = null;
      const previousPointer = pointer;
      pointer = null;
      if (previousPointer !== null && canvas.hasPointerCapture(previousPointer)) canvas.releasePointerCapture(previousPointer);
      changed();
    };
    const resize = () => {
      finish();
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      displayScale = Math.min(rect.width / WIDTH, rect.height / HEIGHT) || 1;
      offsetX = (rect.width - WIDTH * displayScale) / 2;
      offsetY = (rect.height - HEIGHT * displayScale) / 2;
      paint();
    };
    const point = (event: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(WIDTH, (event.clientX - rect.left - offsetX) / displayScale)),
        y: Math.max(0, Math.min(HEIGHT, (event.clientY - rect.top - offsetY) / displayScale)),
      };
    };
    const down = (event: PointerEvent) => {
      if (pointer !== null || event.button !== 0) return;
      if (operations.current.length >= MAX_OPERATIONS) {
        setStatus('El lienzo está lleno. Descárgalo o deshaz trazos antes de continuar.');
        return;
      }
      event.preventDefault();
      keyboardMode = false; keyboardInk = false; finish();
      suspendGames();
      canvas.focus({ preventScroll: true });
      canvas.setPointerCapture(event.pointerId);
      pointer = event.pointerId;
      current = { kind: 'stroke', color: options.current.color, size: Math.min(200, options.current.size / displayScale), erase: options.current.erase, points: [point(event)] };
      paintStroke(ctx, current);
      paint();
      setHistory((value) => ({ ...value, undo: operations.current.length + 1 }));
    };
    const move = (event: PointerEvent) => {
      if (!current || pointer !== event.pointerId) return;
      const events = event.getCoalescedEvents?.() || [event];
      for (const update of events.length ? events : [event]) {
        if (current.points.length >= MAX_POINTS) { finish(); break; }
        const next = point(update);
        const previous = current.points[current.points.length - 1];
        current.points.push(next);
        paintStroke(ctx, { ...current, points: [previous, next] });
      }
      paint();
    };
    const end = (event: PointerEvent) => { if (pointer === event.pointerId) finish(); };
    commands.current = {
      undo: () => { finish(); const last = operations.current.pop(); if (last) redo.current.push(last); redraw(); changed(); },
      redo: () => { finish(); const next = redo.current.pop(); if (next) operations.current.push(next); redraw(); changed(); },
      clear: () => {
        finish();
        if (!operations.current.length) return;
        if (operations.current.length >= MAX_OPERATIONS) {
          setStatus('Descarga el dibujo o deshaz un trazo antes de vaciar el lienzo.');
          return;
        }
        operations.current.push({ kind: 'clear' });
        redo.current = [];
        redraw();
        changed();
      },
    };
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault(); keyboardInk = false;
        if (event.shiftKey) commands.current.redo(); else commands.current.undo();
        return;
      }
      if (event.code === 'Escape' && keyboardInk) { event.preventDefault(); keyboardInk = false; finish(); return; }
      const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (directions[event.code]) {
        event.preventDefault(); keyboardMode = true; suspendGames();
        const [dx, dy] = directions[event.code];
        keyboardPoint.x = Math.max(0, Math.min(WIDTH, keyboardPoint.x + dx * 28));
        keyboardPoint.y = Math.max(0, Math.min(HEIGHT, keyboardPoint.y + dy * 28));
        if (keyboardInk && current) {
          if (current.points.length >= MAX_POINTS) { keyboardInk = false; finish(); }
          else { const previous = current.points[current.points.length - 1]; const next = { ...keyboardPoint }; current.points.push(next); paintStroke(ctx, { ...current, points: [previous, next] }); }
        }
        paint();
        setStatus(keyboardInk ? 'Dibujando con las flechas. Espacio levanta el lápiz.' : 'Mueve con las flechas. Espacio apoya el lápiz.');
      } else if (event.code === 'Space' && !event.repeat) {
        event.preventDefault(); keyboardMode = true; suspendGames();
        if (keyboardInk) { keyboardInk = false; finish(); }
        else if (operations.current.length < MAX_OPERATIONS) {
          finish(); keyboardInk = true;
          current = { kind: 'stroke', color: options.current.color, size: Math.min(200, options.current.size / displayScale), erase: options.current.erase, points: [{ ...keyboardPoint }] };
          paintStroke(ctx, current);
          setHistory((value) => ({ ...value, undo: operations.current.length + 1 }));
          setStatus('Dibujando con las flechas. Espacio levanta el lápiz.');
        }
        paint();
      }
    };
    operations.current = readDrawing();
    queueMicrotask(() => setHistory({ undo: operations.current.length, redo: 0 }));
    redraw();
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('lostpointercapture', end);
    canvas.addEventListener('keydown', key);
    return () => {
      finish();
      clearTimeout(saveTimer);
      const data = JSON.stringify({ version: 1, operations: operations.current });
      if (data.length <= 2_000_000) gameStorage.setItem(STORAGE_KEY, data);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', end);
      canvas.removeEventListener('pointercancel', end);
      canvas.removeEventListener('lostpointercapture', end);
      canvas.removeEventListener('keydown', key);
    };
  }, []);

  const download = () => {
    const board = boardRef.current;
    if (!board) return;
    const output = document.createElement('canvas');
    output.width = WIDTH;
    output.height = HEIGHT;
    const ctx = output.getContext('2d')!;
    ctx.fillStyle = '#0B0716';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(board, 0, 0);
    output.toBlob((blob) => {
      if (!blob) { setStatus('No se pudo exportar el dibujo. Inténtalo de nuevo.'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'mi-obra-latech.png';
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  };

  return (
    <div className={styles.drawing}>
      <div className={styles.drawingSurface}>
        <canvas ref={canvasRef} tabIndex={0} className={styles.drawingCanvas}
          style={{ cursor: erase ? 'cell' : 'crosshair', touchAction: 'none' }}
          aria-label="Pizarra para dibujar. Dedo o ratón para dibujar. Teclado: flechas mueven, espacio apoya o levanta el lápiz. Control Z deshace; Control Mayúsculas Z rehace." />
        {!history.undo && <p className={styles.drawingPlaceholder}>Tu próxima idea empieza con un trazo.</p>}
      </div>
      <div className={styles.palette} aria-label="Colores del lápiz">
        {COLORS.map((c) => (
          <button key={c.value} type="button" aria-label={`Color ${c.name}`} aria-pressed={color === c.value && !erase}
            onClick={() => { setColor(c.value); setErase(false); }} className={styles.colorButton}>
            <span style={{ background: c.value }} />
          </button>
        ))}
      </div>
      <div className={styles.drawingTools}>
        <div className={styles.toolGroup}>
          <button type="button" onClick={() => commands.current.undo()} disabled={!history.undo} aria-label="Deshacer" title="Deshacer (Ctrl Z)" className={styles.iconButton}><Undo2 size={17} /></button>
          <button type="button" onClick={() => commands.current.redo()} disabled={!history.redo} aria-label="Rehacer" title="Rehacer (Ctrl Mayúsculas Z)" className={styles.iconButton}><Redo2 size={17} /></button>
          <button type="button" onClick={() => setErase((value) => !value)} aria-label={erase ? 'Usar lápiz' : 'Usar goma'} aria-pressed={erase} className={styles.iconButton}>{erase ? <Pencil size={17} /> : <Eraser size={17} />}</button>
        </div>
        <div className={styles.toolGroup} aria-label="Grosor">
          {SIZES.map((value) => <button type="button" key={value} aria-label={`Grosor ${value}`} aria-pressed={size === value} onClick={() => setSize(value)} className={styles.iconButton}><span className={styles.brushSize} style={{ width: value + 2, height: value + 2 }} /></button>)}
        </div>
      </div>
      <div className={styles.drawingActions}>
        <button type="button" onClick={() => commands.current.clear()} disabled={!history.undo} className={styles.secondaryButton}><Trash2 size={14} /> Vaciar</button>
        <button type="button" onClick={download} disabled={!history.undo} className={styles.secondaryButton}><Download size={14} /> Guardar PNG</button>
      </div>
      <p role="status" className={styles.storageStatus}>{status}</p>
    </div>
  );
}
