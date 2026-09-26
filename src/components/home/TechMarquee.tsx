'use client';

import { useCallback, useRef } from 'react';
import { useDesktopScrollEffect } from '../effects/Breathe';
import styles from './TechMarquee.module.css';

const capabilities = ['Una marca memorable', 'Más confianza', 'Compra sin fricción', 'Menos tareas'];

export default function TechMarquee() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const render = useCallback((rect: DOMRect, height: number) => {
    const progress = Math.max(0, Math.min(1, (height - rect.top) / (height + rect.height)));
    if (track.current) track.current.style.transform = `translate3d(${(-180 * progress).toFixed(2)}px, 0, 0)`;
  }, []);
  const reset = useCallback(() => track.current?.style.removeProperty('transform'), []);
  useDesktopScrollEffect(section, render, reset);

  return (
    <section ref={section} className={styles.section} aria-labelledby="technology-heading">
      <div className={styles.viewport} aria-hidden="true">
        <div ref={track} className={styles.track}>
          <span>IMPACTO.</span><i>Confianza.</i><span>CARÁCTER.</span><b>✳</b>
          <span>IMPACTO.</span><i>Confianza.</i><span>CARÁCTER.</span>
        </div>
      </div>
      <div className={`site-container ${styles.foundation}`}>
        <h2 id="technology-heading">BONITA ES SOLO EL PRINCIPIO</h2>
        <ul>{capabilities.map(capability => <li key={capability}>{capability}</li>)}</ul>
      </div>
    </section>
  );
}
