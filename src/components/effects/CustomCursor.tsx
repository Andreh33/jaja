'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const ringX = useRef(0);
  const ringY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.body.classList.add('has-custom-cursor');

    const onMove = (e: MouseEvent) => {
      targetX.current = e.clientX;
      targetY.current = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX - 3}px, ${e.clientY - 3}px, 0)`;
      }
    };

    const hoverables = ['a', 'button', '[data-cursor="hover"]', '[role="button"]', 'input', 'textarea', 'select'];
    const isHover = (el: Element | null): boolean => {
      if (!el) return false;
      return hoverables.some((sel) => (el as HTMLElement).matches?.(sel));
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element;
      const target = t?.closest?.(hoverables.join(','));
      if (target && ringRef.current) {
        ringRef.current.classList.add('is-hover');
        if ((target as HTMLElement).dataset.cursor === 'text') {
          ringRef.current.classList.add('is-text');
        }
      }
    };
    const onOut = (e: MouseEvent) => {
      const t = e.target as Element;
      const target = t?.closest?.(hoverables.join(','));
      if (target && ringRef.current) {
        ringRef.current.classList.remove('is-hover');
        ringRef.current.classList.remove('is-text');
      }
    };

    let raf: number;
    const loop = () => {
      ringX.current += (targetX.current - ringX.current) * 0.18;
      ringY.current += (targetY.current - ringY.current) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX.current - 16}px, ${ringY.current - 16}px, 0)`;
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
  }, []);

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
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[9998] h-8 w-8 rounded-full border transition-[width,height,background] duration-200 ease-out"
        style={{ borderColor: 'rgba(139,92,246,0.5)' }}
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
      `}</style>
    </>
  );
}
