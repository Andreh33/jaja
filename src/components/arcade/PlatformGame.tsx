'use client';
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { activeInput, type RemoteInput } from '@/lib/arcade-peer';
import { newPlatformWorld, stepPlatform, PLATFORM_HEIGHT, PLATFORM_WIDTH } from '@/lib/platform-engine';
import styles from './Arcade.module.css';
export default function PlatformGame({ remote }: { remote: MutableRefObject<[RemoteInput, RemoteInput]> }) {
  const canvas = useRef<HTMLCanvasElement>(null); const world = useRef(newPlatformWorld()); const keyboard = useRef(0); const touch = useRef(0);
  const [hud, setHud] = useState(() => ({ score: 0, lives: 3, level: 1, title: newPlatformWorld().title, state: 'playing' })); const [paused, setPaused] = useState(false); const pausedRef = useRef(false); const [artError, setArtError] = useState(false);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => {
    const element = canvas.current; const ctx = element?.getContext('2d'); if (!element || !ctx) return;
    let frame = 0; let disposed = false; let last = performance.now(); let accumulator = 0; let lastHud = 0;
    const backdrops = [1, 2, 3, 4].map(level => { const image = new Image(); image.src = `/arcade/platform-world${level === 1 ? '' : `-${level}`}.webp`; return image; });
    const sprites = new Image(); sprites.src = '/arcade/platform-sprites.webp';
    const mapping: Record<string, number> = { ArrowLeft: 1, KeyA: 1, ArrowRight: 2, KeyD: 2, Space: 4, ArrowUp: 4, KeyW: 4, ShiftLeft: 8, ShiftRight: 8 };
    const down = (event: KeyboardEvent) => { if (event.target instanceof HTMLElement && event.target.closest('button,a,input,select,textarea,[contenteditable=true]')) return; if (mapping[event.code]) { event.preventDefault(); keyboard.current |= mapping[event.code]; } if (event.code === 'KeyP' && !event.repeat) setPaused(value => !value); };
    const up = (event: KeyboardEvent) => { if (mapping[event.code]) { event.preventDefault(); keyboard.current &= ~mapping[event.code]; } };
    const blur = () => { keyboard.current = 0; touch.current = 0; if (document.hidden) setPaused(true); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur); document.addEventListener('visibilitychange', blur);
    const drawSprite = (index: number, x: number, y: number, width: number, height: number, flip = false) => {
      const sourceX = index % 3 * 418; const sourceY = index < 3 ? 0 : index < 6 ? 440 : 835; const sourceHeight = index < 3 ? 440 : index < 6 ? 395 : 419;
      ctx.save(); if (flip) { ctx.translate(x + width, y); ctx.scale(-1, 1); x = 0; y = 0; } ctx.drawImage(sprites, sourceX, sourceY, 418, sourceHeight, x, y, width, height); ctx.restore();
    };
    function draw(now: number) {
      if (disposed) return; const elapsed = Math.min((now - last) / 1000, .05); last = now; const w = world.current;
      if (!pausedRef.current && !document.hidden) { accumulator += elapsed; while (accumulator >= 1 / 120) { stepPlatform(w, keyboard.current | touch.current | activeInput(remote.current[0], now), 1 / 120); accumulator -= 1 / 120; } } else accumulator = 0;
      const context = ctx!; context.clearRect(0, 0, PLATFORM_WIDTH, PLATFORM_HEIGHT);
      const pan = w.camera * .06; context.drawImage(backdrops[Math.min(3, w.level - 1)], -pan % 100 - 50, -25, 1224, 640);
      context.save(); context.translate(-w.camera, 0);
      for (const platform of w.platforms) { if (platform.x + platform.w < w.camera - 100 || platform.x > w.camera + 1100) continue;
        if (platform.brick) { for (let x = platform.x; x < platform.x + platform.w; x += 34) drawSprite(6, x, platform.y, 35, 35); }
        else { // The generated tile's grassy top is ~26% down its source cell.
          for (let x = platform.x; x < platform.x + platform.w; x += 110) { const width = Math.min(114, platform.x + platform.w - x + 4); drawSprite(7, x - 2, platform.y - 40, width, 158); }
        }
      }
      for (const coin of w.coins) if (!coin.taken && coin.x > w.camera - 40 && coin.x < w.camera + 1060) drawSprite(5, coin.x - 16, coin.y - 16 + Math.sin(w.time * 4 + coin.x) * 4, 32, 32);
      for (const enemy of w.enemies) if (!enemy.dead && enemy.x > w.camera - 60 && enemy.x < w.camera + 1080) drawSprite(enemy.drone ? 4 : 3, enemy.x - 6, enemy.y - 8, 50, 44, enemy.direction > 0);
      const finishX = w.width - 210; drawSprite(8, finishX, 335, 125, 145);
      const p = w.player; context.globalAlpha = p.invulnerable > 0 ? .55 + Math.sin(w.time * 16) * .2 : 1;
      const index = !p.grounded ? 2 : Math.abs(p.vx) > 20 && Math.floor(w.time * 10) % 2 ? 1 : 0;
      drawSprite(index, p.x - 13, p.y - 15, 66, 72, p.facing < 0); context.globalAlpha = 1;
      for (const item of w.particles) { context.globalAlpha = Math.min(1, item.life * 2); context.fillStyle = item.color; context.fillRect(item.x, item.y, 4, 4); } context.globalAlpha = 1; context.restore();
      if (now - lastHud > 100) { setHud({ score: w.score, lives: w.lives, level: w.level, title: w.title, state: w.state }); lastHud = now; }
      frame = requestAnimationFrame(draw);
    }
    Promise.all([...backdrops.map(image => image.decode()), sprites.decode()]).then(() => { if (!disposed) frame = requestAnimationFrame(draw); }).catch(() => { if (!disposed) setArtError(true); });
    return () => { disposed = true; cancelAnimationFrame(frame); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', blur); keyboard.current = 0; };
  }, [remote]);
  function restart(next: boolean) { const old = world.current; world.current = newPlatformWorld(next ? old.level + 1 : 1, next ? old.score : 0, next ? Math.min(5, old.lives + 1) : 3); setPaused(false); }
  return <div className={styles.platform}><canvas ref={canvas} className={styles.canvas} width={PLATFORM_WIDTH} height={PLATFORM_HEIGHT} aria-label="Salto Zero. Muévete con flechas o A y D, salta con espacio. Shift acelera. P pausa." tabIndex={0} />
    <div className={styles.runnerHud}><span>0{hud.level} / {hud.title}</span><span>★ {hud.score.toLocaleString('es-ES')} · ♥ {hud.lives}</span></div>
    <div className={styles.runnerHelp}>← → / A D · ESPACIO salta · SHIFT corre · P pausa</div>
    <button className={styles.button} style={{ position: 'absolute', right: 16, bottom: 14, zIndex: 3 }} onClick={() => setPaused(value => !value)}>{paused ? 'Continuar' : 'Pausa'}</button>
    {(paused || hud.state !== 'playing' || artError) && <div className={styles.result}><h3>{artError ? 'El mundo no ha cargado.' : paused ? 'Toma aire.' : hud.state === 'dead' ? 'Otra vida. Otra idea.' : hud.level < 4 ? 'Un salto más lejos.' : 'Has roto el molde.'}</h3><p>{artError ? 'Comprueba la conexión y vuelve a abrir el juego.' : `Puntuación: ${hud.score.toLocaleString('es-ES')} · Nivel ${hud.level} / 4`}</p>{paused ? <button className={styles.button} onClick={() => setPaused(false)}>Seguir jugando</button> : !artError && <button className={styles.button} onClick={() => restart(hud.state === 'complete' && hud.level < 4)}>{hud.state === 'complete' && hud.level < 4 ? 'Siguiente mundo →' : 'Volver a empezar'}</button>}</div>}
  </div>;
}
