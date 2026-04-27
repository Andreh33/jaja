'use client';

import { useEffect, useRef } from 'react';

export default function MouseGlow({ strong = false }: { strong?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handle = (e: MouseEvent) => {
      const now = performance.now();
      if (now - last.current < 16) return;
      last.current = now;
      if (ref.current) {
        ref.current.style.setProperty('--mx', `${e.clientX}px`);
        ref.current.style.setProperty('--my', `${e.clientY}px`);
      }
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[1] ${strong ? 'spotlight-strong' : 'spotlight'}`}
      style={{ '--mx': '50%', '--my': '50%' } as React.CSSProperties}
    />
  );
}
