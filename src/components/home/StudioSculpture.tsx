'use client';

import { useState, type RefObject } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import styles from './HeroPreview.module.css';

export default function StudioSculpture({ viewport }: { viewport: RefObject<HTMLDivElement | null> }) {
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const { scrollYProgress } = useScroll({ container: viewport });
  const transform = useTransform(() => `rotateX(${55 - scrollYProgress.get() * 30}deg) rotateZ(${-32 + scrollYProgress.get() * 100}deg)`);
  return <div className={styles.sculpture} data-open={open} data-instant={keyboard}>
    <div className={styles.sculptureGrid} aria-hidden="true" />
    <span className={styles.sculptureLabel}>EL DISEÑO TIENE OTRA DIMENSIÓN</span>
    <motion.div className={styles.sculptureCore} aria-hidden="true" style={{ transform }}>
      {[0, 1, 2, 3, 4].map(i => <i key={i} style={{ transform: `translateZ(${i * (open ? 27 : 9)}px) rotate(${open ? i * 14 : 0}deg)` }} />)}
    </motion.div>
    <button type="button" aria-pressed={open} onClick={event => { setKeyboard(event.detail === 0); setOpen(value => !value); }}>{open ? 'Reunir las capas' : 'Explorar las capas'}<ArrowUpRight size={14} /></button>
    <span className={styles.sculptureHint}>HAZ SCROLL · CAMBIA LA PERSPECTIVA</span>
  </div>;
}
