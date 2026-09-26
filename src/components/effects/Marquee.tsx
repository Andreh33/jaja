'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

export function Marquee({
  children,
  reverse = false,
  speed = 30,
  className,
  pauseOnHover = false,
}: {
  children: ReactNode;
  reverse?: boolean;
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = container.current;
    const strip = track.current;
    if (!element || !strip || !('IntersectionObserver' in window)) return;
    const media = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let visible = false;
    let focused = element.contains(document.activeElement);
    let hovered = false;
    const sync = () => strip.style.setProperty('--marquee-state', visible && media.matches && !document.hidden && !focused && !(pauseOnHover && hovered) ? 'running' : 'paused');
    const focusIn = () => { focused = true; sync(); };
    const focusOut = (event: FocusEvent) => { focused = event.relatedTarget instanceof Node && element.contains(event.relatedTarget); sync(); };
    const enter = () => { hovered = true; sync(); };
    const leave = () => { hovered = false; sync(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    element.addEventListener('focusin', focusIn);
    element.addEventListener('focusout', focusOut);
    element.addEventListener('mouseenter', enter);
    element.addEventListener('mouseleave', leave);
    media.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      element.removeEventListener('focusin', focusIn);
      element.removeEventListener('focusout', focusOut);
      element.removeEventListener('mouseenter', enter);
      element.removeEventListener('mouseleave', leave);
      media.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [pauseOnHover]);
  return (
    <div ref={container} tabIndex={0} className={cn('group relative flex w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', className)}>
      <div
        ref={track}
        className={cn(
          'flex shrink-0 items-center gap-8 pr-8',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
        )}
        style={{ animationDuration: `${speed}s`, animationPlayState: 'var(--marquee-state, paused)', '--marquee-state': 'paused' } as CSSProperties}
      >
        {children}
        {/* copia visual para el bucle continuo; oculta a lectores de pantalla */}
        <span aria-hidden="true" className="hidden lg:contents">{children}</span>
      </div>
    </div>
  );
}

export function SignatureMarquee() {
  const items = [
    'DISEÑO WEB',
    'TIENDAS ONLINE',
    'AGENTES DE IA',
    'POSICIONAMIENTO SEO',
    'AUTOMATIZACIÓN ÚTIL',
    'MANTENIMIENTO WEB',
    'PASARELAS DE PAGO',
    'SOPORTE 24H',
    'SIN PERMANENCIA',
  ];
  return (
    <div className="relative w-full overflow-hidden" style={{ background: 'var(--grad-signature)' }}>
      <Marquee speed={42}>
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-8 pl-8">
            <span style={{ letterSpacing: '0.18em', fontWeight: 700, fontSize: 11, color: '#070510' }}>{t}</span>
            <span style={{ color: '#070510', fontSize: 14 }}>✦</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
