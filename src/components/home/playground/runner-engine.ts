import type { RefObject } from 'react';
import confetti from 'canvas-confetti';
import { createGameSession, type GameSession, type PauseReason } from './game-session';
import { gameStorage, readGameNumber } from './game-storage';
import { BLOCK_COLORS, GROUND_OFFSET, PLAYER_X, GRAVITY, JUMP_V, RANGES, type Star, type RunnerState, type RunnerStatus } from './runner-model';

type RunnerOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  surfaceRef: RefObject<HTMLDivElement | null>;
  sessionRef: RefObject<GameSession | null>;
  jumpRef: RefObject<() => void>;
  reduceRef: RefObject<boolean>;
  stateRef: RefObject<RunnerStatus>;
  bestRef: RefObject<number>;
  game: RefObject<RunnerState>;
  setPauseReasons: (value: PauseReason[]) => void;
  setCoins: (value: number) => void;
  setScore: (value: number) => void;
  setBest: (value: number) => void;
  setIsRecord: (value: boolean) => void;
  setState: (value: RunnerStatus) => void;
};

export function createRunnerEngine(options: RunnerOptions) {
  const { canvasRef, surfaceRef, sessionRef, jumpRef, reduceRef, stateRef, bestRef, game, setPauseReasons, setCoins, setScore, setBest, setIsRecord, setState } = options;
  const canvas = canvasRef.current!;
  const ctx = canvas.getContext('2d')!;
  let playerX = PLAYER_X;
  let speedScale = 1;
  let W = 0;
  let H = 0;
  let stars: Star[] = [];

  const genStars = () => {
    stars = [];
    const n = Math.round((W * H) / 7000);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.66,
        r: Math.random() * 1.3 + 0.25,
        tw: 0.6 + Math.random() * 2.4,
        ph: Math.random() * Math.PI * 2,
      });
    }
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    playerX = Math.min(PLAYER_X, W * 0.24);
    speedScale = Math.max(0.6, Math.min(1, W / 500));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    genStars();
    sessionRef.current?.render();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const g = game.current;
  const groundY = () => H - GROUND_OFFSET;

  const reset = () => {
    g.y = groundY();
    g.vy = 0;
    g.onGround = true;
    g.jumpsLeft = 2;
    g.dist = 0;
    g.speed = 280 * speedScale;
    g.obstacles = [];
    g.coins = [];
    g.particles = [];
    g.floats = [];
    g.nextSpawn = W + 80;
    g.nextCoin = W + 240;
    g.coinsGot = 0;
    g.combo = 0;
    g.shake = 0;
    g.flash = 0;
    g.deadVy = 0;
    g.deadRot = 0;
    g.dustT = 0;
    setCoins(0);
  };

  const burst = (x: number, y: number, n: number, colors: string[], spread = 1) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = (80 + Math.random() * 260) * spread;
      const life = 0.6 + Math.random() * 0.5;
      g.particles.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 120,
        life, max: life,
        color: colors[i % colors.length],
        r: 2 + Math.random() * 4,
      });
    }
  };

  const ring = (x: number, y: number, color: string) => {
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const v = 150 + Math.random() * 60;
      g.particles.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v * 0.6,
        life: 0.4, max: 0.4, color, r: 2.5,
      });
    }
  };

  const jump = () => {
    if (stateRef.current !== 'playing' || !sessionRef.current?.canPlay()) return;
    const coyote = g.t - g.lastGround < 0.09;
    if (g.onGround || coyote) {
      g.vy = JUMP_V;
      g.onGround = false;
      g.jumpsLeft = 1;
      burst(playerX, groundY() + 4, 7, ['rgba(255,255,255,0.55)']);
    } else if (g.jumpsLeft > 0) {
      // doble salto: un poco más corto + anillo de impulso
      g.vy = JUMP_V * 0.85;
      g.jumpsLeft = 0;
      ring(playerX, g.y - 22, '#bfdbfe');
    }
  };

  const die = () => {
    g.deadVy = -480;
    g.deadRot = 0;
    g.shake = 0.4;
    burst(playerX, g.y - 20, 28, BLOCK_COLORS.concat('#c5eaff'));
    const finalScore = Math.floor(g.dist / 10);
    setScore(finalScore);
    const prevBest = readGameNumber('latech-runner-best');
    if (finalScore > prevBest) {
      gameStorage.setItem('latech-runner-best', String(finalScore));
      setBest(finalScore);
      setIsRecord(true);
      if (prevBest > 0 && !reduceRef.current) {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors: ['#3b82f6', '#93c5fd', '#67c4ff', '#c5eaff'] });
      }
    } else {
      setIsRecord(false);
    }
    stateRef.current = 'over';
    setState('over');
    sessionRef.current?.stop();
  };

  const spawn = () => {
    const gap = 320 + g.speed * 0.55 + Math.random() * 240;
    if (Math.random() < 0.32 && g.dist > 600) {
      g.obstacles.push({ kind: 'sweeper', x: g.nextSpawn, len: 86, speed: 2 + Math.random() * 1.1, angle: Math.random() * Math.PI });
    } else {
      const h = 26 + Math.random() * 30;
      g.obstacles.push({ kind: 'block', x: g.nextSpawn, w: 26 + Math.random() * 22, h, color: BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)] });
    }
    g.nextSpawn += gap;
  };

  const spawnCoins = () => {
    const gy = groundY();
    const count = 3 + Math.floor(Math.random() * 4);
    const startX = g.nextCoin;
    const arc = Math.random() < 0.62;
    const baseH = 46 + Math.random() * 34;
    const peak = 60 + Math.random() * 78;
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0.5;
      const y = arc ? gy - baseH - Math.sin(t * Math.PI) * peak : gy - baseH - Math.random() * 26;
      g.coins.push({ x: startX + i * 34, y, taken: false, ph: Math.random() * Math.PI * 2 });
    }
    g.nextCoin = startX + count * 34 + 260 + Math.random() * 460;
  };

  // Textura de ruido pre-renderizada (grano sutil del "traje").
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 64;
  noiseCanvas.height = 64;
  {
    const nctx = noiseCanvas.getContext('2d')!;
    for (let i = 0; i < 500; i++) {
      nctx.globalAlpha = Math.random() * 0.6;
      nctx.fillStyle = Math.random() > 0.5 ? '#FFFFFF' : '#000000';
      nctx.fillRect(Math.random() * 64, Math.random() * 64, 1.2, 1.2);
    }
  }
  const noisePattern = ctx.createPattern(noiseCanvas, 'repeat')!;

  const drawBean = (x: number, y: number, rot: number, squash: number) => {
    const st = stateRef.current;
    const bw = 34;
    const bh = 46;
    const playing = st === 'playing';
    const dead = st === 'over';
    const airborne = playing && !g.onGround;
    const crowned = playing && bestRef.current > 0 && g.dist / 10 > bestRef.current;
    const gy = groundY();

    // sombra proyectada (se abre y aclara con la altura del salto)
    if (!dead) {
      const hgt = Math.max(0, gy - y);
      ctx.globalAlpha = Math.max(0.12, 0.4 - hgt / 420);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(x, gy + 8, 20 + hgt * 0.07, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // estela fantasma a alta velocidad (sustituye a la antigua capa)
    if (playing && g.speed > 330) {
      const a = Math.min(0.24, (g.speed - 330) / 900);
      for (let i = 1; i <= 4; i++) {
        ctx.globalAlpha = a / i;
        ctx.fillStyle = i % 2 ? '#3b82f6' : '#67c4ff';
        ctx.beginPath();
        ctx.roundRect(x - i * 13 - bw / 2, y - bh, bw, bh - 2, 18);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // aura de energía (glow suave que respira)
    if (!dead) {
      const pulse = 0.9 + Math.sin(g.t * 6) * 0.1;
      const aura = ctx.createRadialGradient(x, y - bh / 2, 2, x, y - bh / 2, bh * 0.95 * pulse);
      aura.addColorStop(0, airborne ? 'rgba(147,197,253,0.4)' : 'rgba(59,130,246,0.28)');
      aura.addColorStop(1, 'rgba(59,130,246,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(x, y - bh / 2, bh * 0.95 * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(1 + (1 - squash) * 0.55, squash);

    // ---- pies con ciclo de carrera ----
    ctx.fillStyle = '#4C1D95';
    for (const s of [-1, 1] as const) {
      const ph = g.runPhase + (s > 0 ? Math.PI : 0);
      const footLift = airborne ? -5 : dead ? 0 : Math.max(0, Math.sin(ph)) * -6;
      const footX = s * 8 + (airborne ? s * -2 : dead ? 0 : Math.cos(ph) * 4);
      ctx.beginPath();
      ctx.ellipse(footX, -2 + footLift, 6.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- cuerpo: luz radial + textura + oclusión + especular + rim ----
    const bodyGrad = ctx.createRadialGradient(-bw * 0.25, -bh * 0.78, 3, 0, -bh / 2, bh * 0.95);
    bodyGrad.addColorStop(0, '#bfdbfe');
    bodyGrad.addColorStop(0.45, '#3b82f6');
    bodyGrad.addColorStop(1, '#1e40af');
    const bodyPath = new Path2D();
    bodyPath.roundRect(-bw / 2, -bh, bw, bh - 3, 17);
    ctx.fillStyle = bodyGrad;
    ctx.fill(bodyPath);

    ctx.save();
    ctx.clip(bodyPath);
    // grano del traje
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = noisePattern;
    ctx.fillRect(-bw, -bh - 4, bw * 2, bh + 10);
    // oclusión inferior (asienta el volumen)
    ctx.globalAlpha = 1;
    const ao = ctx.createLinearGradient(0, -16, 0, -2);
    ao.addColorStop(0, 'rgba(0,0,0,0)');
    ao.addColorStop(1, 'rgba(15,5,35,0.5)');
    ctx.fillStyle = ao;
    ctx.fillRect(-bw / 2, -18, bw, 18);
    // barriga
    const belly = ctx.createLinearGradient(0, -bh + 17, 0, -8);
    belly.addColorStop(0, 'rgba(255,255,255,0.32)');
    belly.addColorStop(1, 'rgba(255,255,255,0.06)');
    ctx.fillStyle = belly;
    ctx.beginPath();
    ctx.roundRect(-bw / 2 + 7, -bh + 19, bw - 14, bh - 28, 11);
    ctx.fill();
    // brillo especular
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-bw * 0.2, -bh * 0.82, 6.5, 9.5, -0.55, 0, Math.PI * 2);
    ctx.fill();
    // rim light cálida en el borde derecho (la luz de la luna del fondo)
    ctx.globalAlpha = 0.7;
    const rim = ctx.createLinearGradient(bw / 2 - 8, 0, bw / 2, 0);
    rim.addColorStop(0, 'rgba(255,200,120,0)');
    rim.addColorStop(1, 'rgba(255,200,120,0.85)');
    ctx.fillStyle = rim;
    ctx.fillRect(bw / 2 - 8, -bh + 5, 8, bh - 14);
    ctx.restore();

    // contorno cartoon
    ctx.strokeStyle = 'rgba(20,8,40,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke(bodyPath);

    // ---- brazos ----
    for (const s of [-1, 1] as const) {
      const swing = airborne ? -1.9 : dead ? 0.6 : Math.sin(g.runPhase + (s > 0 ? Math.PI : 0)) * 0.7;
      ctx.save();
      ctx.translate(s * (bw / 2 - 1), -bh + 23);
      ctx.rotate(s * 0.35 + swing * s);
      ctx.fillStyle = s < 0 ? '#1d4ed8' : '#2563eb';
      ctx.beginPath();
      ctx.roundRect(-3, -1, 6, 13, 3);
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,8,40,0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // ---- cara ----
    const faceY = -bh + 15;
    const lookX = dead ? 0 : 1.6;
    const lookY = dead ? 0 : airborne ? (g.vy < 0 ? -1.8 : 1.6) : 0.4;
    const blink = !dead && Math.sin(g.t * 1.9 + 1) > 0.984;
    for (const s of [-1, 1] as const) {
      const ex = s * 7.5;
      if (dead) {
        ctx.strokeStyle = '#1B1033';
        ctx.lineWidth = 2.2;
        for (const d of [-1, 1] as const) {
          ctx.beginPath();
          ctx.moveTo(ex - 3, faceY - 3 * d);
          ctx.lineTo(ex + 3, faceY + 3 * d);
          ctx.stroke();
        }
      } else {
        const eyeG = ctx.createRadialGradient(ex - 1, faceY - 1.5, 0.5, ex, faceY, 5.5);
        eyeG.addColorStop(0, '#FFFFFF');
        eyeG.addColorStop(1, '#D9D2EE');
        ctx.fillStyle = eyeG;
        ctx.beginPath();
        ctx.ellipse(ex, faceY, 5, blink ? 0.8 : 5.4, 0, 0, Math.PI * 2);
        ctx.fill();
        if (!blink) {
          ctx.fillStyle = '#1B1033';
          ctx.beginPath();
          ctx.arc(ex + lookX, faceY + lookY, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.beginPath();
          ctx.arc(ex + lookX - 1, faceY + lookY - 1, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // cejas (suben cuando salta)
    if (!dead) {
      ctx.strokeStyle = 'rgba(20,8,40,0.85)';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      for (const s of [-1, 1] as const) {
        const browLift = airborne ? -2.5 : 0;
        ctx.beginPath();
        ctx.moveTo(s * 4.4, faceY - 8 + browLift);
        ctx.lineTo(s * 10.2, faceY - 7 + browLift + (airborne ? -2 : 0.6));
        ctx.stroke();
      }
    }
    // mofletes
    ctx.fillStyle = 'rgba(255,77,157,0.35)';
    for (const s of [-1, 1] as const) {
      ctx.beginPath();
      ctx.ellipse(s * 11, faceY + 6.5, 3.4, 2.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // boca
    ctx.strokeStyle = '#1B1033';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    if (dead) {
      ctx.beginPath();
      ctx.moveTo(-5, faceY + 11);
      ctx.quadraticCurveTo(0, faceY + 8.5, 5, faceY + 11);
      ctx.stroke();
      ctx.fillStyle = '#FF4D9D';
      ctx.beginPath();
      ctx.ellipse(3, faceY + 12.5, 2.6, 3.4, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (airborne) {
      ctx.fillStyle = '#2A123F';
      ctx.beginPath();
      ctx.ellipse(0, faceY + 11, 3.6, 4.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FF4D9D';
      ctx.beginPath();
      ctx.ellipse(0, faceY + 13, 2.2, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, faceY + 7, 5.5, 0.22 * Math.PI, 0.78 * Math.PI);
      ctx.stroke();
    }

    // ---- corona cuando vas batiendo tu récord ----
    if (crowned) {
      const cg = ctx.createLinearGradient(-9, -bh - 11, 9, -bh);
      cg.addColorStop(0, '#c5eaff');
      cg.addColorStop(1, '#67c4ff');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.moveTo(-9, -bh - 1);
      ctx.lineTo(-9, -bh - 9);
      ctx.lineTo(-4.5, -bh - 4);
      ctx.lineTo(0, -bh - 11);
      ctx.lineTo(4.5, -bh - 4);
      ctx.lineTo(9, -bh - 9);
      ctx.lineTo(9, -bh - 1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(20,8,40,0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#FFF7E0';
      for (const gx of [-4.5, 0, 4.5] as const) {
        ctx.beginPath();
        ctx.arc(gx, -bh - (gx === 0 ? 10 : 8), 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  };

  // ---------- FONDO ATMOSFÉRICO ----------
  const drawBackground = (gy: number) => {
    // cielo cósmico
    const sky = ctx.createLinearGradient(0, 0, 0, gy + 30);
    sky.addColorStop(0, '#030b18');
    sky.addColorStop(0.5, '#061a30');
    sky.addColorStop(0.82, '#0d2a49');
    sky.addColorStop(1, '#153756');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, gy + 30);

    // estrellas con parpadeo y leve parallax
    const sx = (g.dist * 0.02) % W;
    for (const s of stars) {
      let px = s.x - sx;
      if (px < 0) px += W;
      ctx.globalAlpha = 0.25 + 0.6 * Math.abs(Math.sin(g.t * s.tw + s.ph));
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(px, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // luna / sol: halo cálido que justifica la luz del personaje
    const moonX = W * 0.74 + Math.sin(g.t * 0.05) * 10;
    const moonY = gy - 150 - Math.cos(g.t * 0.05) * 8;
    ctx.globalCompositeOperation = 'lighter';
    const halo = ctx.createRadialGradient(moonX, moonY, 4, moonX, moonY, 150);
    halo.addColorStop(0, 'rgba(255,214,150,0.55)');
    halo.addColorStop(0.4, 'rgba(103,196,255,0.16)');
    halo.addColorStop(1, 'rgba(103,196,255,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,236,200,0.9)';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
    ctx.fill();

    // auroras: cintas onduladas con mezcla aditiva
    const auroras = [
      { y: gy - 230, amp: 26, thick: 60, speed: 0.5, par: 0.04, c: '59,130,246' },
      { y: gy - 180, amp: 34, thick: 52, speed: -0.35, par: 0.07, c: '103,196,255' },
    ];
    for (const a of auroras) {
      ctx.beginPath();
      ctx.moveTo(0, a.y);
      for (let x = 0; x <= W; x += 16) {
        const k = (x + g.dist * a.par) * 0.006 + g.t * a.speed;
        ctx.lineTo(x, a.y + Math.sin(k) * a.amp + Math.sin(k * 2.3) * a.amp * 0.4);
      }
      for (let x = W; x >= 0; x -= 16) {
        const k = (x + g.dist * a.par) * 0.006 + g.t * a.speed;
        ctx.lineTo(x, a.y + a.thick + Math.sin(k) * a.amp + Math.sin(k * 2.3) * a.amp * 0.4);
      }
      ctx.closePath();
      const ag = ctx.createLinearGradient(0, a.y - a.amp, 0, a.y + a.thick + a.amp);
      ag.addColorStop(0, `rgba(${a.c},0)`);
      ag.addColorStop(0.5, `rgba(${a.c},0.12)`);
      ag.addColorStop(1, `rgba(${a.c},0)`);
      ctx.fillStyle = ag;
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    // cordilleras parallax
    for (const r of RANGES) {
      const grad = ctx.createLinearGradient(0, gy - r.base - r.amp, 0, gy + 20);
      grad.addColorStop(0, r.c0);
      grad.addColorStop(1, r.c1);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += r.step) {
        const k = (x + g.dist * r.par) * 0.01;
        const n = (Math.sin(k + r.seed) * 0.6 + Math.sin(k * 2.3 + r.seed * 1.7) * 0.4 + 1) / 2;
        ctx.lineTo(x, gy - r.base - n * r.amp);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    }

    // bruma cálida en el horizonte
    const haze = ctx.createLinearGradient(0, gy - 60, 0, gy + 6);
    haze.addColorStop(0, 'rgba(103,196,255,0)');
    haze.addColorStop(1, 'rgba(103,196,255,0.16)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, gy - 60, W, 66);
  };

  const drawCoin = (cx: number, cy: number, ph: number) => {
    const spin = Math.abs(Math.cos(g.t * 4 + ph));
    const rw = 1 + spin * 8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.shadowColor = '#c5eaff';
    ctx.shadowBlur = 12;
    const cg = ctx.createLinearGradient(0, -8, 0, 8);
    cg.addColorStop(0, '#FFE9A8');
    cg.addColorStop(0.5, '#c5eaff');
    cg.addColorStop(1, '#F59E0B');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.ellipse(0, 0, rw, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (rw > 4) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.ellipse(-rw * 0.3, -2.5, rw * 0.28, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,60,0,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, rw * 0.55, 4.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const loop = (_time: number, dt: number) => {
    g.t += dt;

    const st = stateRef.current;
    const gy = groundY();

    if (st === 'playing') {
      g.speed = Math.min(g.speed + 9 * speedScale * dt, 580 * speedScale);
      g.dist += g.speed * dt;
      setScore(Math.floor(g.dist / 10));
      g.runPhase += dt * (g.speed / 28);

      // física del salto
      g.vy += GRAVITY * dt;
      g.y += g.vy * dt;
      if (g.y >= gy) {
        if (!g.onGround) burst(playerX, gy + 4, 6, ['rgba(255,255,255,0.45)']);
        g.y = gy;
        g.vy = 0;
        g.onGround = true;
        g.jumpsLeft = 2;
        g.lastGround = g.t;
      } else {
        g.onGround = false;
      }

      // polvo al correr
      if (g.onGround) {
        g.dustT -= dt;
        if (g.dustT <= 0) {
          g.dustT = 0.12;
          g.particles.push({
            x: playerX - 12, y: gy + 2,
            vx: -40 - Math.random() * 40, vy: -20 - Math.random() * 30,
            life: 0.4, max: 0.4, color: 'rgba(147,197,253,0.5)', r: 2 + Math.random() * 2,
          });
        }
      }

      // obstáculos
      if (g.nextSpawn - g.dist < W + 100) spawn();
      for (const o of g.obstacles) {
        if (o.kind === 'sweeper') o.angle += o.speed * dt;
      }
      g.obstacles = g.obstacles.filter((o) => o.x - g.dist > -160);

      // monedas
      if (g.nextCoin - g.dist < W + 80) spawnCoins();
      g.coins = g.coins.filter((c) => !c.taken && c.x - g.dist > -40);

      // hitbox del bean
      const px = playerX;
      const py = g.y - 22;
      const pr = 15;

      // recoger monedas
      for (const c of g.coins) {
        const ccx = c.x - g.dist;
        if ((px - ccx) ** 2 + (py - c.y) ** 2 < (pr + 11) ** 2) {
          c.taken = true;
          g.coinsGot += 1;
          g.combo += 1;
          setCoins(g.coinsGot);
          g.flash = Math.min(0.5, g.flash + 0.18);
          burst(ccx, c.y, 8, ['#c5eaff', '#FFE9A8', '#67c4ff']);
          const mult = 1 + Math.floor(g.combo / 5);
          g.floats.push({ x: ccx, y: c.y - 6, vy: -42, life: 0.8, text: mult > 1 ? `+${mult}× ` : '+1', color: '#c5eaff' });
          if (g.combo > 0 && g.combo % 10 === 0) {
            g.floats.push({ x: px, y: py - 40, vy: -34, life: 1, text: `¡combo ${g.combo}!`, color: '#bfdbfe' });
          }
        }
      }

      // colisiones con obstáculos
      for (const o of g.obstacles) {
        const ox = o.x - g.dist;
        if (o.kind === 'block') {
          const cx = Math.max(ox, Math.min(px, ox + o.w));
          const cy = Math.max(gy - o.h, Math.min(py, gy));
          if ((px - cx) ** 2 + (py - cy) ** 2 < pr * pr) { die(); break; }
        } else {
          const pivX = ox;
          const pivY = gy - 104;
          const tipX = pivX + Math.cos(o.angle) * o.len;
          const tipY = pivY + Math.sin(o.angle) * o.len;
          const dx = tipX - pivX;
          const dy = tipY - pivY;
          const t = Math.max(0, Math.min(1, ((px - pivX) * dx + (py - pivY) * dy) / (dx * dx + dy * dy)));
          const qx = pivX + t * dx;
          const qy = pivY + t * dy;
          if ((px - qx) ** 2 + (py - qy) ** 2 < (pr + 8) ** 2) { die(); break; }
        }
      }
    }

    if (st === 'over') {
      g.deadVy += GRAVITY * dt;
      g.y += g.deadVy * dt;
      g.deadRot += dt * 9;
    }

    // partículas
    for (const p of g.particles) {
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    g.particles = g.particles.filter((p) => p.life > 0);
    // textos flotantes
    for (const f of g.floats) {
      f.y += f.vy * dt;
      f.life -= dt;
    }
    g.floats = g.floats.filter((f) => f.life > 0);
    g.shake = Math.max(0, g.shake - dt);
    g.flash = Math.max(0, g.flash - dt * 1.6);

    // ---------- render ----------
    ctx.clearRect(0, 0, W, H);

    drawBackground(gy);

    ctx.save();
    if (g.shake > 0 && !reduceRef.current) {
      ctx.translate((Math.random() - 0.5) * g.shake * 26, (Math.random() - 0.5) * g.shake * 26);
    }

    // suelo
    const groundGrad = ctx.createLinearGradient(0, 0, W, 0);
    groundGrad.addColorStop(0, '#3b82f6');
    groundGrad.addColorStop(0.65, '#67c4ff');
    groundGrad.addColorStop(1, '#c5eaff');
    ctx.strokeStyle = groundGrad;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(59,130,246,0.6)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, gy + 1);
    ctx.lineTo(W, gy + 1);
    ctx.stroke();
    ctx.shadowBlur = 0;
    // líneas de velocidad del suelo
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      const lx = ((i * 137 - g.dist * 1.1) % (W + 60) + W + 60) % (W + 60) - 30;
      ctx.beginPath();
      ctx.moveTo(lx, gy + 12);
      ctx.lineTo(lx + 26, gy + 12);
      ctx.stroke();
    }

    // monedas
    for (const c of g.coins) {
      const ox = c.x - g.dist;
      if (ox < -20 || ox > W + 20) continue;
      drawCoin(ox, c.y, c.ph);
    }

    // obstáculos
    for (const o of g.obstacles) {
      const ox = o.x - g.dist;
      if (ox > W + 160) continue;
      if (o.kind === 'block') {
        ctx.fillStyle = 'rgba(3,9,20,0.85)';
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(ox, gy - o.h, o.w, o.h, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = o.color;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.roundRect(ox, gy - o.h, o.w, o.h, 6);
        ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        const pivY = gy - 104;
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ox, gy);
        ctx.lineTo(ox, pivY);
        ctx.stroke();
        const tipX = ox + Math.cos(o.angle) * o.len;
        const tipY = pivY + Math.sin(o.angle) * o.len;
        const armGrad = ctx.createLinearGradient(ox, pivY, tipX, tipY);
        armGrad.addColorStop(0, '#67c4ff');
        armGrad.addColorStop(1, '#c5eaff');
        ctx.strokeStyle = armGrad;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ox, pivY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        ctx.fillStyle = '#c5eaff';
        ctx.shadowColor = '#c5eaff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#bfdbfe';
        ctx.beginPath();
        ctx.arc(ox, pivY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // partículas
    for (const p of g.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // personaje
    const squash = stateRef.current === 'playing'
      ? g.onGround
        ? 1 + Math.sin(g.runPhase) * 0.05
        : Math.max(0.82, Math.min(1.18, 1 - g.vy / 2400))
      : 1;
    const rot = stateRef.current === 'over' ? g.deadRot : g.onGround ? Math.sin(g.runPhase) * 0.05 : g.vy / 4200;
    drawBean(playerX, Math.min(g.y, H + 80), rot, squash);

    // textos flotantes (sobre el personaje)
    ctx.textAlign = 'center';
    ctx.font = '700 13px ui-monospace, monospace';
    for (const f of g.floats) {
      ctx.globalAlpha = Math.min(1, f.life * 1.6);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';

    ctx.restore();

    // destello dorado al recoger monedas (sobre todo, sin shake)
    if (g.flash > 0 && !reduceRef.current) {
      ctx.globalAlpha = g.flash * 0.5;
      const fl = ctx.createRadialGradient(playerX, gy - 30, 4, playerX, gy - 30, 160);
      fl.addColorStop(0, 'rgba(197,234,255,0.5)');
      fl.addColorStop(1, 'rgba(197,234,255,0)');
      ctx.fillStyle = fl;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  };

  const session = createGameSession({
    element: surfaceRef.current!,
    onFrame: loop,
    onPause: setPauseReasons,
  });
  sessionRef.current = session;
  jumpRef.current = jump;
  const onKey = (event: KeyboardEvent) => {
    if (event.code === 'KeyP' || event.code === 'Escape') {
      if (stateRef.current !== 'playing') return;
      event.preventDefault();
      if (session.canPlay()) session.pause(); else session.play();
    } else if ((event.code === 'Space' || event.code === 'ArrowUp') && stateRef.current === 'playing') {
      event.preventDefault();
      if (!event.repeat) jump();
    }
  };
  const onTap = (event: PointerEvent) => {
    if (stateRef.current !== 'playing') return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    jump();
  };
  canvas.addEventListener('keydown', onKey);
  canvas.addEventListener('pointerdown', onTap);
  game.current.reset = reset;
  reset();
  session.render();

  return () => {
    session.dispose();
    confetti.reset();
    sessionRef.current = null;
    ro.disconnect();
    canvas.removeEventListener('keydown', onKey);
    canvas.removeEventListener('pointerdown', onTap);
  };

}
