'use client';

import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, Trophy } from 'lucide-react';

type Block = { kind: 'block'; x: number; w: number; h: number; color: string };
type Sweeper = { kind: 'sweeper'; x: number; len: number; speed: number; angle: number };
type Obstacle = Block | Sweeper;

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; r: number };

const BLOCK_COLORS = ['#8B5CF6', '#F97316', '#3B82F6', '#10B981'];
const GROUND_OFFSET = 56;
const PLAYER_X = 92;
const GRAVITY = 1900;
const JUMP_V = -640;

export default function StumbleRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [isRecord, setIsRecord] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  const game = useRef({
    y: 0,
    vy: 0,
    onGround: true,
    lastGround: 0,
    dist: 0,
    speed: 280,
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    nextSpawn: 420,
    t: 0,
    shake: 0,
    deadVy: 0,
    deadRot: 0,
    runPhase: 0,
  });

  useEffect(() => {
    setBest(Number(localStorage.getItem('latech-runner-best') || 0));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let lastTime = 0;
    let visible = true;
    let W = 0;
    let H = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      g.dist = 0;
      g.speed = 280;
      g.obstacles = [];
      g.particles = [];
      g.nextSpawn = W + 80;
      g.shake = 0;
      g.deadVy = 0;
      g.deadRot = 0;
    };

    const burst = (x: number, y: number, n: number, colors: string[]) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 80 + Math.random() * 260;
        g.particles.push({
          x, y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 120,
          life: 0.6 + Math.random() * 0.5,
          color: colors[i % colors.length],
          r: 2 + Math.random() * 4,
        });
      }
    };

    const jump = () => {
      if (stateRef.current !== 'playing') return;
      const coyote = g.t - g.lastGround < 0.09;
      if (g.onGround || coyote) {
        g.vy = JUMP_V;
        g.onGround = false;
        burst(PLAYER_X, groundY() + 4, 6, ['rgba(255,255,255,0.5)']);
      }
    };

    const die = () => {
      g.deadVy = -480;
      g.deadRot = 0;
      g.shake = 0.35;
      burst(PLAYER_X, g.y - 20, 26, BLOCK_COLORS.concat('#FBBF24'));
      const finalScore = Math.floor(g.dist / 10);
      setScore(finalScore);
      const prevBest = Number(localStorage.getItem('latech-runner-best') || 0);
      if (finalScore > prevBest) {
        localStorage.setItem('latech-runner-best', String(finalScore));
        setBest(finalScore);
        setIsRecord(true);
        if (prevBest > 0) {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors: ['#8B5CF6', '#C084FC', '#F97316', '#FBBF24'] });
        }
      } else {
        setIsRecord(false);
      }
      setState('over');
    };

    const spawn = () => {
      // Más velocidad → más distancia entre obstáculos para que siempre sea esquivable.
      const gap = 320 + g.speed * 0.55 + Math.random() * 240;
      if (Math.random() < 0.32 && g.dist > 600) {
        g.obstacles.push({ kind: 'sweeper', x: g.nextSpawn, len: 86, speed: 2 + Math.random() * 1.1, angle: Math.random() * Math.PI });
      } else {
        const h = 26 + Math.random() * 30;
        g.obstacles.push({ kind: 'block', x: g.nextSpawn, w: 26 + Math.random() * 22, h, color: BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)] });
      }
      g.nextSpawn += gap;
    };

    const drawBean = (x: number, y: number, rot: number, squash: number) => {
      const bw = 34;
      const bh = 44;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(1 + (1 - squash) * 0.5, squash);
      // sombra
      if (stateRef.current === 'playing') {
        ctx.save();
        ctx.resetTransform();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.scale(dpr, dpr);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(x, groundY() + 8, 20 * squash + 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // cuerpo bean
      const grad = ctx.createLinearGradient(-bw / 2, -bh, bw / 2, 0);
      grad.addColorStop(0, '#A578FF');
      grad.addColorStop(1, '#7C3AED');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-bw / 2, -bh, bw, bh, 17);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // barriga
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.roundRect(-bw / 2 + 7, -bh + 16, bw - 14, bh - 22, 10);
      ctx.fill();
      // ojos
      const blink = Math.sin(g.t * 1.7) > 0.985 ? 0.15 : 1;
      for (const ex of [-7, 7]) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(ex, -bh + 14, 4.5, 4.5 * blink, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#07050E';
        ctx.beginPath();
        ctx.ellipse(ex + 1.5, -bh + 14, 2, 2 * blink, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) { lastTime = time; return; }
      const dt = Math.min((time - lastTime) / 1000 || 0, 0.033);
      lastTime = time;
      g.t += dt;

      const st = stateRef.current;
      const gy = groundY();

      if (st === 'playing') {
        g.speed = Math.min(g.speed + 9 * dt, 580);
        g.dist += g.speed * dt;
        setScore(Math.floor(g.dist / 10));
        g.runPhase += dt * (g.speed / 28);

        // física del salto
        g.vy += GRAVITY * dt;
        g.y += g.vy * dt;
        if (g.y >= gy) {
          if (!g.onGround) burst(PLAYER_X, gy + 4, 5, ['rgba(255,255,255,0.4)']);
          g.y = gy;
          g.vy = 0;
          g.onGround = true;
          g.lastGround = g.t;
        } else {
          g.onGround = false;
        }

        // obstáculos
        if (g.nextSpawn - g.dist < W + 100) spawn();
        for (const o of g.obstacles) {
          if (o.kind === 'sweeper') o.angle += o.speed * dt;
        }
        g.obstacles = g.obstacles.filter((o) => o.x - g.dist > -160);

        // colisiones (hitbox del bean: cápsula aproximada con un círculo)
        const px = PLAYER_X;
        const py = g.y - 22;
        const pr = 15;
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
            // distancia punto-segmento
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
      g.shake = Math.max(0, g.shake - dt);

      // ---------- render ----------
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      if (g.shake > 0) {
        ctx.translate((Math.random() - 0.5) * g.shake * 26, (Math.random() - 0.5) * g.shake * 26);
      }

      // colinas parallax
      for (const [hue, amp, par, alpha] of [['#8B5CF6', 46, 0.18, 0.10], ['#F97316', 30, 0.32, 0.08]] as const) {
        ctx.fillStyle = hue;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        for (let x = 0; x <= W; x += 14) {
          const k = (x + g.dist * par) * 0.012;
          ctx.lineTo(x, gy - 24 - (Math.sin(k) * 0.6 + Math.sin(k * 2.7) * 0.4) * amp - amp);
        }
        ctx.lineTo(W, gy);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // suelo
      const groundGrad = ctx.createLinearGradient(0, 0, W, 0);
      groundGrad.addColorStop(0, '#8B5CF6');
      groundGrad.addColorStop(0.65, '#F97316');
      groundGrad.addColorStop(1, '#FBBF24');
      ctx.strokeStyle = groundGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, gy + 1);
      ctx.lineTo(W, gy + 1);
      ctx.stroke();
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

      // obstáculos
      for (const o of g.obstacles) {
        const ox = o.x - g.dist;
        if (ox > W + 160) continue;
        if (o.kind === 'block') {
          ctx.fillStyle = 'rgba(7,5,14,0.85)';
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
          // poste
          ctx.strokeStyle = 'rgba(255,255,255,0.25)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(ox, gy);
          ctx.lineTo(ox, pivY);
          ctx.stroke();
          // brazo
          const tipX = ox + Math.cos(o.angle) * o.len;
          const tipY = pivY + Math.sin(o.angle) * o.len;
          const armGrad = ctx.createLinearGradient(ox, pivY, tipX, tipY);
          armGrad.addColorStop(0, '#F97316');
          armGrad.addColorStop(1, '#FBBF24');
          ctx.strokeStyle = armGrad;
          ctx.lineWidth = 7;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(ox, pivY);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();
          // bola del extremo
          ctx.fillStyle = '#FBBF24';
          ctx.shadowColor = '#FBBF24';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(tipX, tipY, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          // pivote
          ctx.fillStyle = '#C9A6FF';
          ctx.beginPath();
          ctx.arc(ox, pivY, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // partículas
      for (const p of g.particles) {
        ctx.globalAlpha = Math.max(0, p.life);
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
      drawBean(PLAYER_X, Math.min(g.y, H + 80), rot, squash);

      ctx.restore();
    };

    // pausa cuando no está en pantalla o la pestaña está oculta
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(canvas);
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVis);

    const onKey = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && stateRef.current === 'playing') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', onKey);
    const onTap = (e: PointerEvent) => { e.preventDefault(); jump(); };
    canvas.addEventListener('pointerdown', onTap);

    // expone reset/jump al ciclo de React a través del ref
    (game.current as typeof game.current & { reset?: () => void }).reset = reset;

    reset();
    raf = requestAnimationFrame((t) => { lastTime = t; loop(t); });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('pointerdown', onTap);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    (game.current as typeof game.current & { reset?: () => void }).reset?.();
    setScore(0);
    setIsRecord(false);
    setState('playing');
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className="relative flex-1 overflow-hidden rounded-2xl"
        style={{ background: 'rgba(7,5,14,0.55)', border: '1px solid var(--border-subtle)' }}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ touchAction: 'none', cursor: state === 'playing' ? 'pointer' : 'default' }}
          aria-label="Minijuego: salta los obstáculos"
        />

        {/* HUD */}
        <div className="pointer-events-none absolute left-3 top-3 rounded-full px-3 py-1.5 font-mono text-xs text-white/85"
          style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)' }}>
          {score} m
        </div>
        {best > 0 && (
          <div className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs"
            style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border-subtle)', backdropFilter: 'blur(8px)', color: '#FBBF24' }}>
            <Trophy size={11} /> {best} m
          </div>
        )}

        {state === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            style={{ background: 'rgba(7,5,14,0.45)', backdropFilter: 'blur(3px)' }}>
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(180deg, var(--purple-400), var(--purple-600))', boxShadow: '0 8px 32px var(--purple-glow)' }}
            >
              <Play size={15} /> Jugar
            </button>
            <p className="text-xs text-white/50">Pulsa, toca o usa espacio para saltar</p>
          </div>
        )}

        {state === 'over' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(7,5,14,0.55)', backdropFilter: 'blur(4px)' }}>
            <p className="font-display text-3xl font-bold text-white">¡Eliminado!</p>
            <p className="font-mono text-sm text-white/70">
              {score} m {isRecord && <span style={{ color: '#FBBF24' }}>· ¡nuevo récord! 🏆</span>}
            </p>
            <button
              onClick={start}
              className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(180deg, var(--purple-400), var(--purple-600))', boxShadow: '0 8px 32px var(--purple-glow)' }}
            >
              <RotateCcw size={14} /> Otra vez
            </button>
          </div>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-white/40">
        Salta los bloques y esquiva las barras giratorias. Cada vez va más rápido.
      </p>
    </div>
  );
}
