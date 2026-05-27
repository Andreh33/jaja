'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

export default function AuroraBackground({ intensity = 'normal' }: { intensity?: 'normal' | 'strong' | 'subtle' }) {
  const blobOpacity = intensity === 'strong' ? 0.55 : intensity === 'subtle' ? 0.25 : 0.4;

  // Parallax de profundidad: cada luz se desplaza a distinto ritmo con el
  // scroll. La `y` va en un wrapper aparte para no pisar el `transform` de la
  // animación CSS (blob-1/2/3) que mantiene su deriva orgánica.
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 2000], [0, 240]);
  const y2 = useTransform(scrollY, [0, 2000], [0, -180]);
  const y3 = useTransform(scrollY, [0, 2000], [0, 130]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <motion.div style={{ y: y1 }} className="absolute -left-40 -top-40 h-[600px] w-[600px]">
        <div
          className="h-full w-full rounded-full"
          style={{ background: '#8B5CF6', opacity: blobOpacity, filter: 'blur(140px)', animation: 'blob-1 22s ease-in-out infinite' }}
        />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute -right-40 bottom-[10%] h-[640px] w-[640px]">
        <div
          className="h-full w-full rounded-full"
          style={{ background: '#F97316', opacity: blobOpacity * 0.85, filter: 'blur(160px)', animation: 'blob-2 28s ease-in-out infinite' }}
        />
      </motion.div>
      <motion.div style={{ y: y3 }} className="absolute left-[40%] top-[40%] h-[420px] w-[420px]">
        <div
          className="h-full w-full rounded-full"
          style={{ background: '#FBBF24', opacity: blobOpacity * 0.5, filter: 'blur(140px)', animation: 'blob-3 30s ease-in-out infinite' }}
        />
      </motion.div>
    </div>
  );
}
