/**
 * Sistema de movimiento de Latech. Tokens compartidos para que TODA la web
 * anime "de la misma mano" (la diferencia entre premium y amateur).
 */

/** Easing principal (el que ya usa el Hero): salida suave y elegante. */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const DUR = { fast: 0.4, base: 0.7, slow: 1.1 } as const;

/** Variantes Framer reutilizables. */
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_OUT_EXPO } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.base, ease: EASE_OUT_EXPO } },
};

/** Contenedor para escalonar la entrada de los hijos. */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

/** Hijo de un stagger (entrada con máscara/clip vertical, look editorial). */
export const revealItem = {
  hidden: { opacity: 0, y: 36, clipPath: 'inset(0 0 100% 0)' },
  show: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0% 0)',
    transition: { duration: DUR.slow, ease: EASE_OUT_EXPO },
  },
};
