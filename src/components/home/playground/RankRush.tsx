'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowUpRight, MousePointer2, Pause, Play, RotateCcw, Search, Trophy, Zap } from 'lucide-react';
import { createGameSession, PAUSE_LABELS, type GameSession, type PauseReason } from './game-session';
import { gameStorage, readGameNumber } from './game-storage';
import {
  advanceRankRush, newRankRushState, rankRushPosition, rankRushRate,
  rankRushRequiredRate, RANK_RUSH_SECONDS, startRankRush, tapRankRush,
  type RankRushMode, type RankRushState,
} from './rank-rush-model';
import styles from './rank-rush.module.css';

const COMPETITORS = [
  { domain: 'plantilla-infinita.example', title: 'La misma web. Otra vez.', icon: 'P' },
  { domain: 'plugin-sobre-plugin.example', title: 'Un plugin para cada problema', icon: '+' },
  { domain: 'cargando-todavia.example', title: 'Espera… ya casi carga', icon: '↻' },
  { domain: 'web-del-2012.example', title: 'Bienvenido al pasado', icon: 'W' },
  { domain: 'nadie-me-encuentra.example', title: 'Una gran idea, invisible', icon: '?' },
];

const bestKey = (mode: RankRushMode) => `latech-rank-rush-${mode}-best-ms`;
const seconds = (milliseconds: number) => `${(milliseconds / 1000).toFixed(1)} s`;

export default function RankRush() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const tapRef = useRef<HTMLButtonElement>(null);
  const sessionRef = useRef<GameSession | null>(null);
  const game = useRef(newRankRushState());
  const lastActiveFrame = useRef<number | null>(null);
  const [snapshot, setSnapshot] = useState(() => newRankRushState());
  const [pauseReasons, setPauseReasons] = useState<PauseReason[]>([]);
  const [best, setBest] = useState<Record<RankRushMode, number>>({ rush: 0, steady: 0 });
  const bestRef = useRef<Record<RankRushMode, number>>({ rush: 0, steady: 0 });
  const reducedMotion = useReducedMotion();

  const advanceClock = useCallback((time: number) => {
    const delta = lastActiveFrame.current === null ? 0 : (time - lastActiveFrame.current) / 1000;
    lastActiveFrame.current = time;
    const next = advanceRankRush(game.current, delta);
    game.current = next;
    return next;
  }, []);

  const publish = useCallback((next: RankRushState) => {
    game.current = next;
    setSnapshot(next);
    if (next.status !== 'won' && next.status !== 'over') return;
    sessionRef.current?.stop();
    if (next.status === 'won') {
      const result = Math.round(next.elapsed * 1000);
      const known = [bestRef.current[next.mode], readGameNumber(bestKey(next.mode), 0, 60_000)].filter((value) => value > 0);
      const previous = known.length ? Math.min(...known) : 0;
      if (!previous || result < previous) {
        gameStorage.setItem(bestKey(next.mode), String(result));
        bestRef.current = { ...bestRef.current, [next.mode]: result };
        setBest(bestRef.current);
      }
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    queueMicrotask(() => {
      if (!disposed) {
        bestRef.current = { rush: readGameNumber(bestKey('rush'), 0, 60_000), steady: readGameNumber(bestKey('steady'), 0, 60_000) };
        setBest(bestRef.current);
      }
    });
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    const element = surfaceRef.current;
    if (!element) return;
    let lastPaint = 0;
    const session = createGameSession({
      element,
      onPause: (reasons) => { lastActiveFrame.current = null; setPauseReasons(reasons); },
      onFrame: (time) => {
        const next = advanceClock(time);
        if (next.status === 'won' || next.status === 'over') publish(next);
        else if (time - lastPaint >= 80) { setSnapshot(next); lastPaint = time; }
      },
    });
    sessionRef.current = session;
    return () => { session.dispose(); sessionRef.current = null; };
  }, [advanceClock, publish]);

  const start = () => {
    publish(startRankRush(game.current.mode));
    tapRef.current?.focus({ preventScroll: true });
    sessionRef.current?.play();
    lastActiveFrame.current = sessionRef.current?.canPlay() ? performance.now() : null;
  };
  const resume = () => {
    tapRef.current?.focus({ preventScroll: true });
    sessionRef.current?.play();
    lastActiveFrame.current = sessionRef.current?.canPlay() ? performance.now() : null;
  };
  const press = () => {
    if (game.current.status !== 'playing') { start(); return; }
    if (!sessionRef.current?.canPlay()) { resume(); return; }
    publish(tapRankRush(advanceClock(performance.now())));
  };
  const setMode = (mode: RankRushMode) => {
    if (game.current.status === 'playing' && sessionRef.current?.canPlay()) return;
    sessionRef.current?.stop();
    lastActiveFrame.current = null;
    publish(newRankRushState(mode));
  };

  const paused = snapshot.status === 'playing' && pauseReasons.length > 0;
  const rank = rankRushPosition(snapshot.progress);
  const rate = rankRushRate(snapshot);
  const requiredRate = rankRushRequiredRate(snapshot);
  const timeLeft = Math.max(0, Math.ceil(RANK_RUSH_SECONDS - snapshot.elapsed));
  const rowPosition = reducedMotion ? rank - 1 : 5 * (1 - snapshot.progress / 100);
  const active = snapshot.status === 'playing' && !paused;
  const label = snapshot.status === 'idle' ? 'Empezar a subir' : snapshot.status === 'won' || snapshot.status === 'over' ? 'Otra partida' : paused ? 'Reanudar' : '¡Dale, sube!';
  const message = snapshot.status === 'won' ? `¡Número uno! Lo has conseguido en ${snapshot.elapsed.toFixed(1)} segundos.`
    : snapshot.status === 'over' ? `Tiempo. Tu mejor posición fue la ${rankRushPosition(snapshot.peak)}. ¿Otra oportunidad?`
      : paused ? PAUSE_LABELS[pauseReasons[0]]
        : snapshot.status === 'playing' ? `Posición ${rank} de 6. ${rank <= 3 ? 'Último esfuerzo. Sube el ritmo.' : 'Cada clic te acerca a la cima.'}`
          : 'Haz despegar tu web. Un clic cada vez.';

  return <div ref={surfaceRef} className={styles.game} data-rank-rush-state={paused ? 'paused' : snapshot.status}
    onKeyDown={(event) => {
      if ((event.key.toLowerCase() === 'p' || event.key === 'Escape') && game.current.status === 'playing') {
        event.preventDefault();
        if (event.repeat) return;
        if (sessionRef.current?.canPlay()) sessionRef.current.pause(); else resume();
      }
    }}>
    <div className={styles.console}>
      <div className={styles.titleRow}><span className={styles.kicker}><Zap size={12} aria-hidden /> RANK RUSH</span><span className={styles.liveTag}>ARCADE SEO</span></div>
      <h3>La cima no<br />se regala<span>.</span></h3>
      <p className={styles.intro}>Sube tu web al primer puesto. Cuanto más alto llegas, más rápido tendrás que pulsar. Si aflojas, caes.</p>
      <fieldset className={styles.modes} disabled={active}>
        <legend className="sr-only">Ritmo del juego</legend>
        <button type="button" aria-pressed={snapshot.mode === 'rush'} onClick={() => setMode('rush')}>Rápido</button>
        <button type="button" aria-pressed={snapshot.mode === 'steady'} onClick={() => setMode('steady')}>Ritmo suave</button>
      </fieldset>
      <div className={styles.hud} aria-label="Estado de la partida">
        <div><span>POSICIÓN</span><strong>#{rank.toString().padStart(2, '0')}</strong></div>
        <div><span>TIEMPO</span><strong>{timeLeft}<small>s</small></strong></div>
        <div><span>RITMO</span><strong>{rate}<small>/s</small></strong></div>
      </div>
      <button ref={tapRef} type="button" className={styles.tapButton} onClick={press}
        onKeyDown={(event) => {
          if (event.code !== 'Space' && event.code !== 'Enter') return;
          event.preventDefault();
          if (!event.repeat) press();
        }} aria-label={active ? 'Impulsar tu web, pulsa repetidamente' : label}>
        {active ? <MousePointer2 size={20} aria-hidden /> : snapshot.status === 'playing' ? <Play size={18} aria-hidden /> : <ArrowUpRight size={20} aria-hidden />}
        <span>{label}</span><span className={styles.keyCap} aria-hidden>↵</span>
      </button>
      <div className={styles.controls}>
        {snapshot.status === 'playing' && <>
          <button type="button" onClick={() => paused ? resume() : sessionRef.current?.pause()}>{paused ? <Play size={13} /> : <Pause size={13} />}{paused ? 'Reanudar' : 'Pausar'}</button>
          <button type="button" onClick={start}><RotateCcw size={13} /> Reiniciar</button>
        </>}
        {snapshot.status !== 'playing' && <span>Clic, toque, espacio o enter.</span>}
      </div>
      <p className={styles.best}><Trophy size={12} aria-hidden /> {best[snapshot.mode] ? `Tu récord: ${seconds(best[snapshot.mode])}` : 'Tu próximo récord empieza aquí.'}</p>
    </div>

    <div className={styles.browser} aria-label="Buscador de juego, resultados ficticios">
      <div className={styles.chrome}><span aria-hidden><i /><i /><i /></span><span>latech.search / simulación</span><span aria-hidden>↗</span></div>
      <div className={styles.searchBar}><span className={styles.searchBrand}>G<span>o</span>o<span>g</span>le</span><div><Search size={15} aria-hidden /><span>mi negocio en primera posición</span></div></div>
      <div className={styles.searchMeta}><span>Todos los resultados</span><span>Tu web contra el resto.</span></div>
      <div className={styles.results} aria-hidden="true">
        {COMPETITORS.map((result, index) => {
          const slot = index >= rank - 1 ? index + 1 : index;
          return <div key={result.domain} className={styles.result} style={{ transform: `translateY(${slot * 100}%)` }}>
            <span className={styles.rankNumber}>{slot + 1}</span><span className={styles.favicon}>{result.icon}</span>
            <div><small>{result.domain}</small><strong>{result.title}</strong></div>
          </div>;
        })}
        <div className={`${styles.result} ${styles.target}`} style={{ transform: `translateY(${rowPosition * 100}%)` }}>
          <span className={styles.rankNumber}>{rank}</span><span className={styles.favicon}>LT</span>
          <div><small>tu-negocio.example <b>ESTA ES LA TUYA</b></small><strong>Una web que juega en otra liga <ArrowUpRight size={13} /></strong></div>
        </div>
      </div>
      {snapshot.status !== 'idle' && <div className={styles.pressure}><span>{active ? `Para mantenerte: ${requiredRate.toFixed(1)} clics/s` : snapshot.status === 'won' ? 'La primera posición ya es tuya.' : paused ? 'Tu posición está a salvo.' : 'Cada intento cuenta.'}</span><span>{Math.floor(snapshot.progress)}%</span></div>}
      {(paused || snapshot.status === 'won' || snapshot.status === 'over') && <div className={styles.browserOverlay}>
        {snapshot.status === 'won' ? <Trophy size={34} aria-hidden /> : paused ? <Pause size={30} aria-hidden /> : <RotateCcw size={30} aria-hidden />}
        <strong>{snapshot.status === 'won' ? 'Arriba del todo.' : paused ? 'Respira. Seguimos.' : 'La cima te espera.'}</strong>
        <p>{snapshot.status === 'won' ? `${snapshot.elapsed.toFixed(1)} segundos. ${snapshot.taps} clics. Una buena remontada.` : paused ? 'Reanuda cuando quieras. El reloj también descansa.' : `Llegaste al puesto #${rankRushPosition(snapshot.peak)}. Prueba a mantener un ritmo constante.`}</p>
      </div>}
    </div>
    <p className={styles.status} role="status" aria-live="polite">{message}</p>
    <p className={styles.disclaimer}>Simulación independiente, no afiliada a Google. El SEO real no funciona a clics. Récord guardado solo en este dispositivo.</p>
  </div>;
}
