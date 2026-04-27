'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

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
  return (
    <div className={cn('group relative flex w-full overflow-hidden', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center gap-8 pr-8',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

export function SignatureMarquee() {
  const items = ['DISEÑO WEB', 'TIENDAS ONLINE', 'AGENTES DE IA', 'BADAJOZ', 'PRESUPUESTO 24H', 'SIN PERMANENCIA'];
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
