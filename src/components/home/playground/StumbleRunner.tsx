'use client';

import { useEffect, useRef, useState } from 'react';
import { createRunnerEngine } from './runner-engine';
import { trackLabGameStart } from '@/lib/lab-analytics';
import { newRunnerState } from './runner-model';
import { Play, Pause, RotateCcw, Trophy, Coins } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { type GameSession, type PauseReason, PAUSE_LABELS } from './game-session';
import { readGameNumber } from './game-storage';
import styles from './games.module.css';

export default function StumbleRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<GameSession | null>(null);
  const jumpRef = useRef<() => void>(() => {});
  const [pauseReasons, setPauseReasons] = useState<PauseReason[]>([]);
  const reducedMotion = useReducedMotion();
  const reduceRef = useRef(false);
  useEffect(() => { reduceRef.current = !!reducedMotion; }, [reducedMotion]);
  const [state, setState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [best, setBest] = useState(0);
  const [isRecord, setIsRecord] = useState(false);

  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  const bestRef = useRef(best);
  useEffect(() => { bestRef.current = best; }, [best]);

  const game = useRef(newRunnerState());

  useEffect(() => {
    queueMicrotask(() => setBest(readGameNumber('latech-runner-best')));
  }, []);

  useEffect(() => createRunnerEngine({
    canvasRef, surfaceRef, sessionRef, jumpRef, reduceRef, stateRef, bestRef, game, setPauseReasons, setCoins, setScore, setBest, setIsRecord, setState
  }), []);

  const start = () => {
    trackLabGameStart('runner');
    game.current.reset?.();
    setScore(0);
    setCoins(0);
    setIsRecord(false);
    stateRef.current = 'playing';
    setState('playing');
    canvasRef.current?.focus({ preventScroll: true });
    sessionRef.current?.play();
  };
  const resume = () => {
    canvasRef.current?.focus({ preventScroll: true });
    sessionRef.current?.play();
  };
  const paused = state === 'playing' && pauseReasons.length > 0;

  return (
    <div ref={surfaceRef} className={styles.runner} aria-label="Latech Runner">
      <div className={styles.runnerSurface}>
        <canvas ref={canvasRef} tabIndex={0} className={styles.runnerCanvas}
          style={{ touchAction: state === 'playing' && !paused ? 'none' : 'pan-y' }}
          aria-label="Minijuego: corre, salta y recoge monedas. Espacio o flecha arriba: salto. P: pausa." />
        <div className={styles.runnerHud} aria-label="Puntuación">
          <span>{score} m</span>
          <span><Coins size={12} aria-hidden /> {coins}</span>
          {best > 0 && <span className={styles.runnerBest}><Trophy size={12} aria-hidden /> {best} m</span>}
        </div>
        {state === 'idle' && (
          <div className={styles.runnerOverlay}>
            <span className={styles.gameEyebrow}>Un salto. Mil posibilidades.</span>
            <h4 className={styles.gameTitle}>Corre a tu manera.</h4>
            <p>Toca para saltar. Toca otra vez en el aire para un doble salto. Esquiva bloques y recoge monedas.</p>
            <button type="button" onClick={start} className={styles.primaryButton}><Play size={16} /> Jugar</button>
            <small>Con teclado: espacio o ↑. Pausa con P.</small>
          </div>
        )}
        {paused && (
          <div className={styles.runnerOverlay}>
            <h4 className={styles.gameTitle}>Un respiro.</h4>
            <p>{PAUSE_LABELS[pauseReasons[0]]}</p>
            <button type="button" onClick={resume} className={styles.primaryButton}><Play size={16} /> Reanudar</button>
            <button type="button" onClick={start} className={styles.secondaryButton}><RotateCcw size={15} /> Empezar de nuevo</button>
          </div>
        )}
        {state === 'over' && (
          <div className={styles.runnerOverlay} aria-live="polite">
            <h4 className={styles.gameTitle}>¡Eliminado!</h4>
            <p>{score} m · {coins} monedas{isRecord ? ' · ¡Nuevo récord!' : ''}</p>
            <button type="button" onClick={start} className={styles.primaryButton}><RotateCcw size={16} /> Otra vez</button>
          </div>
        )}
      </div>
      {state === 'playing' && !paused && (
        <div className={styles.runnerControls}>
          <button type="button" onClick={() => { canvasRef.current?.focus({ preventScroll: true }); jumpRef.current(); }} className={styles.secondaryButton}>Saltar <span aria-hidden>↑</span></button>
          <button type="button" onClick={() => sessionRef.current?.pause()} className={styles.secondaryButton}><Pause size={15} /> Pausar</button>
        </div>
      )}
      <p className={styles.runnerNote}>Tu récord se guarda en este dispositivo. La partida se pausa cuando sales del juego.</p>
    </div>
  );
}
