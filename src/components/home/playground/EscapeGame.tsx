'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'framer-motion';
import { createEscapeEngine } from './escape-engine';
import { SKINS, SKIN_KEY, MODE_KEY, GAMEMODE_KEY, COINS_KEY, OWNED_KEY, NAME_KEY, readCoins, readOwned, type Skin } from './escape-model';
import { type GameSession, type PauseReason, PAUSE_LABELS } from './game-session';
import { gameStorage, readGameNumber } from './game-storage';
import styles from './games.module.css';
import { useEscapeRanking } from './use-escape-ranking';
import { X, RotateCcw, Play, Pause, Volume2, VolumeX, Heart, Shield, Sparkles } from 'lucide-react';

function EscapeExperience({ onClose }: { onClose: () => void }) {
  const open = true;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sessionRef = useRef<GameSession | null>(null);
  const jumpRef = useRef<() => void>(() => {});
  const cutJumpRef = useRef<() => void>(() => {});
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);
  const [pauseReasons, setPauseReasons] = useState<PauseReason[]>([]);
  const [lowEffects, setLowEffects] = useState(false);
  const prefersReduced = useReducedMotion();
  const reduceRef = useRef(false);
  useEffect(() => { reduceRef.current = !!prefersReduced || lowEffects; }, [prefersReduced, lowEffects]);
  const [checkpoint, setCheckpoint] = useState(0);
  const checkpointRef = useRef(0);
  const practiceRef = useRef(false);
  const [practice, setPractice] = useState(false);
  const [alias, setAlias] = useState('Tú');

  const layerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  const [over, setOver] = useState(false);
  const [result, setResult] = useState({ score: 0, best: 0, record: false, killedBy: '' as string, runs: 0, dodged: 0, won: false });
  const [hud, setHud] = useState({ lives: 0, shield: false, coins: 0 });
  const hudRef = useRef(setHud);
  const [muted, setMuted] = useState(true);
  const mutedRef = useRef(true);
  const soundRef = useRef<() => void>(() => {});
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const resetRef = useRef<(fromCheckpoint?: boolean) => void>(() => {});
  const dashRef = useRef<() => void>(() => {});

  const [mode, setMode] = useState<'facil' | 'normal'>('facil');
  const modeRef = useRef<'facil' | 'normal'>('facil');
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { if (open) { const m = (gameStorage.getItem(MODE_KEY) as 'facil' | 'normal') || 'facil'; queueMicrotask(() => setMode(m === 'normal' ? 'normal' : 'facil')); } }, [open]);
  const chooseMode = (m: 'facil' | 'normal') => { setMode(m); modeRef.current = m; gameStorage.setItem(MODE_KEY, m); };

  const [gameMode, setGameMode] = useState<'campana' | 'infinito'>('infinito');
  const gameModeRef = useRef<'campana' | 'infinito'>('infinito');
  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
  useEffect(() => { if (open) { const gm = (gameStorage.getItem(GAMEMODE_KEY) as 'campana' | 'infinito') || 'infinito'; queueMicrotask(() => setGameMode(gm === 'campana' ? 'campana' : 'infinito')); } }, [open]);
  const chooseGameMode = (gm: 'campana' | 'infinito') => { setGameMode(gm); gameModeRef.current = gm; gameStorage.setItem(GAMEMODE_KEY, gm); };

  const [skin, setSkin] = useState('default');
  const [owned, setOwned] = useState<string[]>(['default']);
  const [coins, setCoins] = useState(0);
  const ranking = useEscapeRanking({ mode: gameMode, difficulty: mode });
  const rankingRef = useRef(ranking);
  useEffect(() => { rankingRef.current = ranking; }, [ranking]);
  const skinRef = useRef('default');
  useEffect(() => { skinRef.current = skin; }, [skin]);
  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      const o = readOwned(); setOwned(o); setCoins(readCoins());
      setAlias((gameStorage.getItem(NAME_KEY) || 'Tú').slice(0, 14));
      setLowEffects(gameStorage.getItem('latech-escape-low-effects') === 'true');
      const saved = gameStorage.getItem(SKIN_KEY) || 'default';
      setSkin(o.includes(saved) ? saved : 'default');
    });
  }, [open]);
  const equipSkin = (id: string) => { if (!readOwned().includes(id)) return; setSkin(id); skinRef.current = id; gameStorage.setItem(SKIN_KEY, id); };
  const buySkin = (s: Skin) => { const c = readCoins(), o = readOwned(); if (o.includes(s.id) || c < s.price) return; const nc = c - s.price, no = [...o, s.id]; gameStorage.setItem(COINS_KEY, String(nc)); gameStorage.setItem(OWNED_KEY, JSON.stringify(no)); setCoins(nc); setOwned(no); setSkin(s.id); skinRef.current = s.id; gameStorage.setItem(SKIN_KEY, s.id); };
  useEffect(() => {
    const saved = gameMode === 'campana' ? readGameNumber(`latech-escape-checkpoint-${mode}`, 0, 3) : 0;
    checkpointRef.current = saved;
    queueMicrotask(() => setCheckpoint(saved));
  }, [gameMode, mode]);

  useEffect(() => createEscapeEngine({
    canvasRef, layerRef, zoomRef, scoreRef, dialogRef, sessionRef, mutedRef, soundRef, modeRef, gameModeRef, skinRef, startedRef, checkpointRef, practiceRef, reduceRef, rankingRef, hudRef, resetRef, jumpRef, cutJumpRef, dashRef, setPauseReasons, setResult, setCoins, setOver, setStarted, setCheckpoint, setPractice
  }), []);


  const paused = started && !over && pauseReasons.length > 0;
  const resume = () => {
    canvasRef.current?.focus({ preventScroll: true });
    sessionRef.current?.play();
  };
  const start = (practice = false) => { resetRef.current(practice); };
  const backToMenu = () => {
    ranking.discard();
    sessionRef.current?.stop();
    startedRef.current = false;
    setStarted(false);
    setOver(false);
  };
  if (typeof document === 'undefined') return null;
  return createPortal(
    <dialog ref={dialogRef} className={`escape-overlay ${styles.escapeDialog}`} aria-labelledby="escape-title"
      onCancel={(event) => { event.preventDefault(); onCloseRef.current(); }}>
      <div ref={zoomRef} className={styles.escapeScene}>
        <div ref={layerRef} className={styles.escapeLayers} aria-hidden inert />
        <canvas ref={canvasRef} className={styles.escapeCanvas} tabIndex={started && !over && !paused ? 0 : -1}
          aria-label="Escape: espacio o W para saltar, D o Mayúsculas para dash, P para pausar, Escape para salir." />
      </div>
      <header className={styles.escapeHeader}>
        <div className={styles.escapeIdentity}>
          <span className={styles.gameEyebrow}>Latech Lab</span>
          <h2 id="escape-title">Escape</h2>
        </div>
        <div className={styles.escapeTopActions}>
          <button type="button" className={styles.escapeIcon} aria-label={muted ? 'Activar sonido' : 'Silenciar'}
            onClick={() => { mutedRef.current = !muted; setMuted(!muted); soundRef.current(); }}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
          <button type="button" className={styles.escapeIcon} aria-label="Salir del juego" onClick={onClose}><X size={20} /></button>
        </div>
      </header>

      {started && !over && (
        <>
          <div className={styles.escapeHud} aria-label="Estado de la partida">
            <span>Esquivados <strong ref={scoreRef}>0</strong></span>
            <span>🪙 {hud.coins}</span>
            <span className={styles.escapeHearts}>{Array.from({ length: hud.lives }).map((_, i) => <Heart key={i} size={16} aria-label="Vida" fill="currentColor" />)}{hud.shield && <Shield size={18} aria-label="Escudo" />}</span>
            <button type="button" className={styles.secondaryButton} onClick={() => sessionRef.current?.pause()} aria-label="Pausar juego"><Pause size={15} /> Pausa</button>
          </div>
          {!paused && <div className={styles.escapeControls}>
            <button type="button" className={styles.escapeJump}
              onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); canvasRef.current?.focus({ preventScroll: true }); jumpRef.current(); }}
              onPointerUp={(event) => { cutJumpRef.current(); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
              onPointerCancel={() => cutJumpRef.current()} onLostPointerCapture={() => cutJumpRef.current()}
              onClick={(event) => { if (event.detail === 0) { canvasRef.current?.focus({ preventScroll: true }); jumpRef.current(); } }}>
              Saltar <span>mantén para subir más</span>
            </button>
            <button type="button" className={styles.escapeDash} onClick={() => { canvasRef.current?.focus({ preventScroll: true }); dashRef.current(); }}>Dash <span>impulso · D / ⇧</span></button>
          </div>}
        </>
      )}

      {(!started || paused || over) && <div className={styles.escapeCurtain}>
        <section className={styles.escapeCard} aria-label={!started ? 'Cómo jugar a Escape' : paused ? 'Partida pausada' : 'Resultado de la partida'}>
          {!started && <>
            <span className={styles.gameEyebrow}>Tu web se convierte en el escenario.</span>
            <h3 className={styles.escapeCardTitle}>Sal de lo establecido.</h3>
            <p className={styles.escapeCopy}>Salta sobre los componentes, recoge monedas y vence a los cuatro jefes. Un juego hecho con la propia web.</p>
            <div className={styles.escapeTutorial}>
              <p><strong>01 · Salta</strong>Toca o pulsa espacio. Mantén para subir más; repite en el aire para un doble salto.</p>
              <p><strong>02 · Impúlsate</strong>Dash te protege y rompe obstáculos. Se recarga cada 2,4 segundos.</p>
              <p><strong>03 · Lee al rival</strong>Pisa la W y a los jefes desde arriba, o usa dash. Puedes aterrizar encima de las tarjetas.</p>
            </div>
            <fieldset className={styles.escapeChoice}><legend>Tu recorrido</legend>
              {(['campana', 'infinito'] as const).map((value) => <button type="button" key={value} aria-pressed={gameMode === value} onClick={() => chooseGameMode(value)}>{value === 'campana' ? 'Campaña · 4 actos' : 'Infinito · tu récord'}</button>)}
            </fieldset>
            <fieldset className={styles.escapeChoice}><legend>Dificultad</legend>
              {(['facil', 'normal'] as const).map((value) => <button type="button" key={value} aria-pressed={mode === value} onClick={() => chooseMode(value)}>{value === 'facil' ? 'Fácil · vida y escudo' : 'Normal · un intento'}</button>)}
            </fieldset>
            <label className={styles.escapeEffects}><input type="checkbox" checked={lowEffects || !!prefersReduced} disabled={!!prefersReduced}
              onChange={(event) => { setLowEffects(event.target.checked); gameStorage.setItem('latech-escape-low-effects', String(event.target.checked)); }} /> Efectos suaves · sin destellos ni sacudidas</label>
            <button type="button" className={styles.primaryButton} onClick={() => start()}><Play size={17} /> Jugar</button>
            {gameMode === 'campana' && checkpoint > 0 && <button type="button" className={styles.secondaryButton} onClick={() => start(true)}>Continuar acto {checkpoint + 1} · entrenamiento</button>}
            <p className={styles.escapeFine}>Sin registro. El sonido empieza desactivado. Tú decides si publicas tu puntuación.</p>
          </>}

          {paused && <>
            <span className={styles.gameEyebrow}>La partida te espera.</span>
            <h3 className={styles.escapeCardTitle}>Un respiro.</h3>
            <p className={styles.escapeCopy}>{PAUSE_LABELS[pauseReasons[0]]}</p>
            <button type="button" onClick={resume} className={styles.primaryButton}><Play size={17} /> Reanudar</button>
            <button type="button" onClick={() => start()} className={styles.secondaryButton}><RotateCcw size={16} /> Reiniciar partida</button>
            <button type="button" onClick={backToMenu} className={styles.secondaryButton}>Volver al menú</button>
          </>}

          {over && <>
            <span className={styles.gameEyebrow}>{practice ? 'Entrenamiento' : gameMode === 'campana' ? 'Campaña' : 'Infinito'} · {mode === 'facil' ? 'Fácil' : 'Normal'}</span>
            {result.won && <Sparkles size={26} className="text-amber-300" />}
            <h3 className={styles.escapeCardTitle}>{result.won ? '¡Reconstruiste la web!' : `¡Te pilló ${result.killedBy}!`}</h3>
            <p className={styles.escapeCopy}>{result.score} esquivados · {result.best} de récord local{result.record ? ' · ¡Nuevo récord!' : ''}</p>
            <p className={styles.escapeFine}>Partida {result.runs} · {result.dodged} esquivados en total. Monedas disponibles: {coins}.</p>

            {!practice && <div className={styles.escapePublish}>
              <label htmlFor="escape-alias">Tu nombre en el ranking</label>
              <input id="escape-alias" maxLength={14} value={alias} disabled={ranking.aliasLocked} autoComplete="off"
                onChange={(event) => { setAlias(event.target.value); gameStorage.setItem(NAME_KEY, event.target.value); }} />
              {(ranking.status === 'ready' || ranking.status === 'error' || ranking.status === 'saving') &&
                <button type="button" disabled={ranking.status === 'saving' || !alias.trim()} onClick={() => ranking.publish(alias)} className={styles.secondaryButton}>
                  {ranking.status === 'saving' ? 'Publicando…' : ranking.status === 'error' ? 'Reintentar publicación' : 'Publicar mi puntuación'}
                </button>}
              <p role="status">{ranking.status === 'connecting' ? 'Conectando con el ranking…' : ranking.message || 'Publicación opcional. Tu récord local ya está guardado.'}</p>
            </div>}

            {ranking.top.length > 0 && <div className={styles.escapeRanking}>
              <h4>Ranking · {gameMode === 'campana' ? 'campaña' : 'infinito'} · {mode}</h4>
              <ol>{ranking.top.slice(0, 5).map((entry, index) => <li key={entry.id ?? index}><span>{index + 1}. {entry.name}</span><strong>{entry.score}</strong></li>)}</ol>
            </div>}
            <div className={styles.escapeSkins}><h4>Tu personaje · canjea monedas</h4>
              <div>{SKINS.map((item) => {
                const own = owned.includes(item.id);
                return <button type="button" key={item.id} disabled={!own && coins < item.price} aria-pressed={skin === item.id}
                  aria-label={`${item.name}${own ? ', disponible' : `, ${item.price} monedas`}`}
                  onClick={() => own ? equipSkin(item.id) : buySkin(item)} style={{ background: `linear-gradient(135deg, ${item.c0}, ${item.c2})` }}>
                  {!own ? item.price : skin === item.id ? '✓' : <span aria-hidden>●</span>}
                </button>;
              })}</div>
            </div>
            <div className={styles.escapeResultActions}>
              <button type="button" onClick={() => start()} className={styles.primaryButton}><RotateCcw size={16} /> Otra vez</button>
              <button type="button" onClick={backToMenu} className={styles.secondaryButton}>Elegir modo</button>
            </div>
            {gameMode === 'campana' && checkpoint > 0 && !result.won && <button type="button" className={styles.secondaryButton} onClick={() => start(true)}>Continuar acto {checkpoint + 1} · entrenamiento</button>}
          </>}
        </section>
      </div>}
    </dialog>,
    document.body,
  );
}

export default function EscapeGame({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <EscapeExperience onClose={onClose} /> : null;
}
