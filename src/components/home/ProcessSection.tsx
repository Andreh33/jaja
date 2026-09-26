'use client';

import { useCallback, useRef } from 'react';
import { Reveal } from '../effects/Reveal';
import { useDesktopScrollEffect } from '../effects/Breathe';
import styles from './ProcessSection.module.css';

const steps = [
  ['01', 'La idea.', 'Nos cuentas qué quieres conseguir. Escuchamos, preguntamos y definimos el alcance.'],
  ['02', 'La dirección.', 'Damos forma a tu identidad digital. Diseño, contenido y recorrido aprobados contigo.'],
  ['03', 'El código.', 'Construimos cada detalle. Interacciones, integraciones y pruebas en móvil y escritorio.'],
  ['04', 'El despegue.', 'Publicamos, medimos y seguimos a tu lado. Tu web evoluciona con tu negocio.'],
];
export default function ProcessSection() {
  const timeline = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLSpanElement>(null);
  const markers = useRef<(HTMLSpanElement | null)[]>([]);
  const render = useCallback((rect: DOMRect, height: number) => {
    const progress = Math.max(0, Math.min(1, (height * .72 - rect.top) / (height * .45)));
    if (beam.current) beam.current.style.transform = `scaleX(${progress.toFixed(4)})`;
    markers.current.forEach((marker, index) => {
      if (marker) marker.style.opacity = progress >= index / (steps.length - 1) ? '1' : '0';
    });
  }, []);
  const reset = useCallback(() => {
    beam.current?.style.removeProperty('transform');
    markers.current.forEach(marker => marker?.style.removeProperty('opacity'));
  }, []);
  useDesktopScrollEffect(timeline, render, reset);

  return (
    <section id="proceso" className={`section-space ${styles.section}`} aria-labelledby="process-heading">
      <div className="site-container">
        <Reveal className="section-heading">
          <div><p className="eyebrow">04 / DEL «Y SI…» AL «YA ESTÁ»</p><h2 id="process-heading">Así lo hacemos<br /><span className={styles.emphasis}>realidad.</span></h2></div>
          <p className={styles.intro}>Comunicación directa. Un proceso claro.<br />Y obsesión por los detalles.</p>
        </Reveal>
        <div ref={timeline} className={styles.timeline}>
          <div className={styles.rail} aria-hidden="true"><span ref={beam} /></div>
          <ol className={styles.steps}>
            {steps.map(([number, title, description], index) => (
              <li key={number} className={styles.step}>
                <span className={styles.marker} aria-hidden="true"><span ref={element => { markers.current[index] = element; }} /></span>
                <span className={styles.number} aria-hidden="true">{number}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
