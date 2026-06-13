'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

// La sección "respira": late muy sutilmente según su posición en el viewport.
// Aditivo y discreto; si el usuario pide menos movimiento, no hace nada.
export default function Breathe({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rawScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.986, 1, 0.992]);
  const scale = useSpring(rawScale, { stiffness: 80, damping: 26, mass: 0.4 });

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} className={className} style={{ scale, willChange: 'transform' }}>
      {children}
    </motion.div>
  );
}
