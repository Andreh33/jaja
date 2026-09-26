'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { FolderOpen, Home, Maximize2, Power } from 'lucide-react';
import styles from './CrtTelevision.module.css';

type CrtTelevisionProps = {
  children?: ReactNode;
  paused: boolean;
  onNavigate: (page: 'home' | 'projects', keyboard: boolean) => void;
  onExpand: (trigger: HTMLButtonElement) => void;
};

/** A physical surround for the existing live DOM, never a screenshot of it. */
export default function CrtTelevision({ children, paused, onNavigate, onExpand }: CrtTelevisionProps) {
  const [tubeEffect, setTubeEffect] = useState(true);
  const [keyboard, setKeyboard] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tuning, setTuning] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tuningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wearId = useId();

  useEffect(() => {
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); }, { rootMargin: '100px' });
    if (root.current) observer.observe(root.current);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); if (tuningTimer.current) clearTimeout(tuningTimer.current); };
  }, []);

  function tune() {
    if (!tubeEffect) return;
    if (tuningTimer.current) clearTimeout(tuningTimer.current);
    setTuning(true);
    tuningTimer.current = setTimeout(() => setTuning(false), 180);
  }

  return (
    <div ref={root} className={styles.television} data-crt-television data-tube={tubeEffect} data-paused={paused || !visible} data-keyboard={keyboard} data-tuning={tuning} onClickCapture={event => { if (event.detail > 0 && (event.target as Element).closest('[data-studio-navigation] button')) tune(); }}>
      <div className={styles.halo} aria-hidden="true" />
      <div className={styles.shadow} aria-hidden="true" />
      <div className={styles.rear} aria-hidden="true" />
      <div className={styles.top} aria-hidden="true" />
      <div className={styles.side} aria-hidden="true"><span className={styles.vents} /><span className={styles.serial}>LATECH / COLOR SYSTEM</span><i className={styles.screw} /></div>
      <div className={styles.foot} aria-hidden="true" />
      <div className={styles.body} aria-hidden="true">
        <div className={styles.paint} />
        <svg className={styles.wear} viewBox="0 0 700 600" preserveAspectRatio="none" fill="none">
          <defs><filter id={wearId} x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".16 .7" numOctaves="3" seed="9" result="roughness" /><feDisplacementMap in="SourceGraphic" in2="roughness" scale="2.5" xChannelSelector="R" yChannelSelector="G" /></filter></defs>
          <g filter={`url(#${wearId})`}>
          <path d="M17 52c-1-17 1-29 11-34m7-3 14-1M647 14l20 2 10 6M687 110l1 14M20 540l3 20 8 10 12 4M83 584l28 1m28 0 13-1M652 583l17-4 9-6" stroke="#a3acb4" strokeWidth="3.5" opacity=".42" strokeLinecap="round" />
          <path d="m22 43 2-12 4-7m-7 29 1 7M660 20l9 1 8 7M26 551l4 13 10 8M91 581h20m-6 3h26M653 580l9-2" stroke="#d8d9d4" strokeWidth="1.2" opacity=".38" />
          <path d="M19 55c-2-20 1-34 21-37m-19 13 1-5m34-10 36-1M656 16l15 2 7 5M685 86l1 30M22 546l4 18 10 8M649 579l16-2 8-4M106 582l34 1m-11-4 13 1" stroke="#b8d6ff" strokeWidth="1.2" opacity=".36" />
          <path d="m32 543 5 13m-1-19 3 9M651 23l13 1m-8 3 8 1M86 20l21-1m-16 4 7-1M627 575l15-2m-29 4 5-1" stroke="#020d43" strokeWidth="1" opacity=".65" />
          <path d="m178 567 14-2m-12 5 6-1M48 77l1 13m1-32v5M570 582h10" stroke="#d8eaff" strokeWidth=".7" opacity=".24" />
          <path d="m42 553 31-7m-29 12 43-10m-34 13 19-5m-35-5 8-2M595 35l39-5m-27 9 31-5m-16 7 8-1M308 579l41-1m-32-3 16-1M685 262l-1 36m4-17-1 9" stroke="#bbc4c9" strokeWidth=".9" opacity=".44" />
          <path d="m46 555 27-6m-11 9 13-3M607 36l28-4M314 578h24M686 265l-1 12" stroke="#020d1c" strokeWidth=".75" opacity=".72" />
          </g>
        </svg>
        <span className={styles.caseSeam} />
      </div>
      <div className={styles.bezel} aria-hidden="true" />
      {children}
      <div className={styles.glass} aria-hidden="true">
        <i className={styles.corner} data-crt-corner="0" /><i className={styles.corner} data-crt-corner="1" /><i className={styles.corner} data-crt-corner="2" /><i className={styles.corner} data-crt-corner="3" />
        <span className={styles.scanlines} />
        <span className={styles.phosphor} />
        <span className={styles.sweep} />
        <span className={styles.signal} />
        <span className={styles.reflection} />
      </div>
      <div className={styles.controls} data-crt-controls onKeyDownCapture={() => setKeyboard(true)} onPointerDownCapture={() => setKeyboard(false)}>
        <span className={styles.jack} aria-hidden="true" />
        <div className={styles.speaker} aria-hidden="true" />
        <div className={styles.badge} aria-hidden="true"><b>LATECH</b><span>COLOUR / STUDIO</span></div>
        <div className={styles.channels}>
          <button type="button" onClick={event => { onNavigate('home', event.detail === 0); if (event.detail > 0) tune(); }} aria-label="Canal 01: inicio de Latech Studio" title="Inicio de Latech Studio"><Home size={12} /><span>01</span></button>
          <button type="button" onClick={event => { onNavigate('projects', event.detail === 0); if (event.detail > 0) tune(); }} aria-label="Canal 02: proyectos de Latech Studio" title="Proyectos en Latech Studio"><FolderOpen size={12} /><span>02</span></button>
          <button type="button" onClick={event => onExpand(event.currentTarget)} aria-label="Ampliar la pantalla de la televisión" title="Ampliar la pantalla"><Maximize2 size={12} /><span>AV</span></button>
        </div>
        <div className={styles.powerGroup}>
          <span className={styles.led} aria-hidden="true" />
          <button type="button" className={styles.power} aria-label="Efecto de tubo" aria-pressed={tubeEffect} title={tubeEffect ? 'Desactivar efecto de tubo' : 'Activar efecto de tubo'} onClick={() => setTubeEffect(value => !value)}><Power size={16} /></button>
        </div>
      </div>
    </div>
  );
}
