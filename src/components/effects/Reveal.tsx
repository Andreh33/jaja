'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE_OUT_EXPO, DUR } from '@/lib/motion';

// Reveal compartido (lo usan proyectos, tienda, blog, sobre-nosotros, contacto…).
// Elevado al sistema de movimiento: entrada con desplazamiento + micro-escala,
// curva y duración unificadas. Sin clip-path para no recortar sombras de cards.
const item: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.slow, ease: EASE_OUT_EXPO } },
};

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof typeof motion;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component: any = (motion as any)[Tag] || motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.985 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.slow, ease: EASE_OUT_EXPO, delay } },
      }}
    >
      {children}
    </Component>
  );
}

export function RevealGroup({
  children,
  stagger = 0.09,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export const RevealItem = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div className={className} variants={item}>
    {children}
  </motion.div>
);
