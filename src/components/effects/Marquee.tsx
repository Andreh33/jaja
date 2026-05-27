'use client';

import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { motion, useScroll, useVelocity, useTransform, useSpring } from 'framer-motion';

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
  // Reacción a la velocidad de scroll: la fila se inclina ligeramente al
  // scrollear rápido (detalle de agencia premium). El skew va en un wrapper
  // aparte para no pisar el translateX de la animación CSS del marquee.
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 300 });
  const skew = useTransform(smoothVelocity, [-2500, 0, 2500], [-3.5, 0, 3.5], { clamp: true });

  return (
    <div className={cn('group relative flex w-full overflow-hidden', className)}>
      <motion.div style={{ skewX: skew }} className="flex w-full">
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
      </motion.div>
    </div>
  );
}

export function SignatureMarquee() {
  const items = [
    'DISEÑO WEB',
    'TIENDAS ONLINE',
    'AGENTES DE IA',
    'POSICIONAMIENTO SEO',
    'AUTOMATIZACIONES N8N',
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
