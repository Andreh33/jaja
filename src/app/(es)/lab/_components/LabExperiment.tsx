'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Play, X } from 'lucide-react';
import type { ExperimentSlug } from '../_lib/experiments';
import styles from '../lab.module.css';

const loading = () => <p className={styles.loading} role="status">Preparando el experimento…</p>;
const EscapeGame = dynamic(() => import('@/components/home/playground/EscapeGame'), { ssr: false, loading });
const Runner = dynamic(() => import('@/components/home/playground/StumbleRunner'), { ssr: false, loading });
const RankRush = dynamic(() => import('@/components/home/playground/RankRush'), { ssr: false, loading });
const DrawingBoard = dynamic(() => import('@/components/home/playground/DrawingBoard'), { ssr: false, loading });
const HoodReveal = dynamic(() => import('@/components/home/playground/HoodReveal'), { ssr: false, loading });
const XRayMode = dynamic(() => import('@/components/effects/XRayMode'), { ssr: false, loading });

class ExperimentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className={styles.loading} role="alert"><p>No se ha podido cargar el experimento. Comprueba tu conexión y vuelve a intentarlo.</p><button type="button" className={styles.button} onClick={() => window.location.reload()}>Recargar página</button></div>;
    return this.props.children;
  }
}

export default function LabExperiment({ kind, action, children }: { kind: ExperimentSlug; action: string; children: ReactNode }) {
  const [active, setActive] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const inline = kind === 'runner' || kind === 'lienzo' || kind === 'rank-rush';
  useEffect(() => { if (active && inline) closer.current?.focus(); }, [active, inline]);
  function close() { setActive(false); requestAnimationFrame(() => opener.current?.focus()); }
  return <div className={styles.experimentStage} data-escape-origin>
    {(!active || !inline) && <div className={styles.launcher}>{children}<div className={styles.launchControls}><button ref={opener} type="button" className={styles.button} onClick={() => active ? close() : setActive(true)}><Play size={18} aria-hidden />{active ? 'Cerrar experimento' : action}</button><p>Se carga al abrirlo. Tú decides cuándo empezar.</p></div></div>}
    {active && <ExperimentBoundary>
      {inline && <div className={styles.closeRow}><span>{kind === 'rank-rush' ? 'Rank Rush' : kind === 'runner' ? 'Latech Runner' : 'Lienzo libre'}</span><button ref={closer} type="button" onClick={close} className={styles.closeButton}><X size={17} aria-hidden /> Cerrar experimento</button></div>}
      {kind === 'rank-rush' && <div className={styles.rankStage}><RankRush /></div>}
      {kind === 'escape' && <EscapeGame open onClose={close} />}
      {kind === 'runner' && <div className={styles.runnerStage}><Runner /></div>}
      {kind === 'lienzo' && <div className={styles.drawingStage}><DrawingBoard /></div>}
      {kind === 'capo' && <HoodReveal open onClose={close} />}
      {kind === 'rayos-x' && <XRayMode open onClose={close} />}
    </ExperimentBoundary>}
    <noscript><p className={styles.loading}>Activa JavaScript para usar este experimento. Puedes leer sus instrucciones y explorar el resto de la web sin activarlo.</p></noscript>
  </div>;
}
