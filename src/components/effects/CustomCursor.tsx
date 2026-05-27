'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const ringX = useRef(0);
  const ringY = useRef(0);
  // Solo en dispositivos con puntero fino (ratón). En táctil no renderizamos
  // nada — antes los <div> quedaban clavados en la esquina (cursor "fantasma").
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setEnabled(mq.matches);
    // rAF: evita setState síncrono en el cuerpo del efecto y un parpadeo de hidratación.
    const raf = requestAnimationFrame(update);
    mq.addEventListener('change', update);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add('has-custom-cursor');

    const onMove = (e: MouseEvent) => {
      targetX.current = e.clientX;
      targetY.current = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 3}px, ${e.clientY - 3}px, 0)`;
      }
    };

    const hoverables = ['a', 'button', '[data-cursor="hover"]', '[role="button"]', 'input', 'textarea', 'select'];
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      const target = t?.closest?.(hoverables.join(','));
      if (target && ringRef.current) {
        ringRef.current.classList.add('is-hover');
        if ((target as HTMLElement).dataset.cursor === 'text') {
          ringRef.current.classList.add('is-text');
        }
      }
      // Etiqueta contextual: cualquier elemento con data-cursor-label.
      const labelTarget = t?.closest?.('[data-cursor-label]') as HTMLElement | null;
      if (labelTarget && labelRef.current && ringRef.current) {
        labelRef.current.textContent = labelTarget.dataset.cursorLabel || '';
        labelRef.current.classList.add('is-visible');
        ringRef.current.classList.add('is-label');
      }
    };
    const onOut = (e: MouseEvent) => {
      const t = e.target as Element;
      const target = t?.closest?.(hoverables.join(','));
      if (target && ringRef.current) {
        ringRef.current.classList.remove('is-hover');
        ringRef.current.classList.remove('is-text');
      }
      const labelTarget = t?.closest?.('[data-cursor-label]');
      if (labelTarget && labelRef.current && ringRef.current) {
        labelRef.current.classList.remove('is-visible');
        ringRef.current.classList.remove('is-label');
      }
    };

    let raf: number;
    const loop = () => {
      ringX.current += (targetX.current - ringX.current) * 0.18;
      ringY.current += (targetY.current - ringY.current) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX.current - 16}px, ${ringY.current - 16}px, 0)`;
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate3d(${ringX.current + 22}px, ${ringY.current - 8}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mouseout', onOut);
    raf = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-1.5 w-1.5 rounded-full"
        style={{ background: 'var(--purple-400)', mixBlendMode: 'screen' }}
        aria-hidden
      />
      <div
        ref={ringRef}
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[9998] h-8 w-8 rounded-full border transition-[width,height,background,opacity] duration-200 ease-out"
        style={{ borderColor: 'rgba(139,92,246,0.5)' }}
        aria-hidden
      />
      <div
        ref={labelRef}
        className="cursor-label pointer-events-none fixed left-0 top-0 z-[9999]"
        aria-hidden
      />
      <style jsx global>{`
        .cursor-ring.is-hover {
          width: 56px;
          height: 56px;
          background: rgba(139, 92, 246, 0.18);
          border-color: rgba(139, 92, 246, 0.7);
        }
        .cursor-ring.is-text {
          width: 4px;
          height: 32px;
          border-radius: 2px;
          background: rgba(139, 92, 246, 0.7);
          border-color: transparent;
        }
        /* Cuando hay etiqueta, el anillo se desvanece (deja protagonismo al label). */
        .cursor-ring.is-label {
          opacity: 0;
        }
        .cursor-label {
          font-family: var(--font-syne), system-ui, sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #fff;
          padding: 7px 14px;
          border-radius: 999px;
          background: var(--grad-signature);
          white-space: nowrap;
          opacity: 0;
          transform-origin: left center;
          scale: 0.7;
          transition: opacity 0.22s ease, scale 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
        }
        .cursor-label.is-visible {
          opacity: 1;
          scale: 1;
        }
      `}</style>
    </>
  );
}
