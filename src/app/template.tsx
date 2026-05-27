'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { EASE_OUT_EXPO } from '@/lib/motion';

/**
 * Transición de página tipo app: al navegar, el contenido nuevo entra con un
 * fundido suave. `template.tsx` se re-monta en cada navegación (a diferencia
 * de `layout.tsx`), así que aquí va la animación de entrada.
 *
 * IMPORTANTE: solo opacidad. Un `transform` aquí crearía un bloque contenedor
 * y rompería los elementos `position: fixed` (Navbar, Aurora, cursor…).
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
