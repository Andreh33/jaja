'use client';

import { useEffect, useRef } from 'react';
import { GripHorizontal } from 'lucide-react';
import styles from './Hero.module.css';

export default function StudioWindowHandle() {
  const button = useRef<HTMLButtonElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const drag = useRef<{ id: number; x: number; y: number; ox: number; oy: number } | null>(null);
  useEffect(() => {
    const recenter = () => { if (button.current) move(button.current, 0, 0); };
    window.addEventListener('resize', recenter);
    return () => window.removeEventListener('resize', recenter);
  }, []);
  function move(button: HTMLButtonElement, x: number, y: number) {
    const panel = button.closest<HTMLElement>('[data-studio-window]');
    if (!panel) return;
    const maxX = Math.max(0, (window.innerWidth - panel.offsetWidth) / 2 - 8);
    const maxY = Math.max(0, (window.innerHeight - panel.offsetHeight) / 2 - 8);
    position.current = { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
    panel.style.transform = `translate(calc(-50% + ${position.current.x}px), calc(-50% + ${position.current.y}px))`;
  }
  return <button ref={button} type="button" className={styles.windowHandle} aria-label="Mover ventana. Usa las flechas o arrastra; Inicio la centra."
    onPointerDown={event => { if (drag.current || event.pointerType !== 'mouse') return; drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, ox: position.current.x, oy: position.current.y }; event.currentTarget.setPointerCapture(event.pointerId); }}
    onPointerMove={event => { const d = drag.current; if (!d || d.id !== event.pointerId) return; move(event.currentTarget, d.ox + event.clientX - d.x, d.oy + event.clientY - d.y); }}
    onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
    onLostPointerCapture={() => { drag.current = null; }}
    onPointerCancel={() => { drag.current = null; }}
    onDoubleClick={event => move(event.currentTarget, 0, 0)}
    onKeyDown={event => { const { x, y } = position.current; const keys: Record<string, [number, number]> = { ArrowLeft: [x - 20, y], ArrowRight: [x + 20, y], ArrowUp: [x, y - 20], ArrowDown: [x, y + 20], Home: [0, 0] }; if (keys[event.key]) { event.preventDefault(); move(event.currentTarget, ...keys[event.key]); } }}><GripHorizontal size={18} /><span>ARRASTRA PARA MOVER</span></button>;
}
