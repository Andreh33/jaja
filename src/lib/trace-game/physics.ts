import { TRACE_PHYSICS, type TraceLevel } from './level';
export type TraceRun = { x: number; y: number; vy: number; grounded: boolean; coyote: number; jumpBuffer: number; time: number; status: 'playing' | 'lost' | 'won' };
export function newTraceRun(level: TraceLevel): TraceRun {
  return { x: 80, y: level.platforms[0].y, vy: 0, grounded: true, coyote: .1, jumpBuffer: 0, time: 0, status: 'playing' };
}
export function requestTraceJump(run: TraceRun) { if (run.status === 'playing') run.jumpBuffer = .14; }
/** Fixed substeps keep collision behavior stable at different display frame rates. */
export function stepTraceRun(run: TraceRun, level: TraceLevel, elapsed: number) {
  if (run.status !== 'playing' || !Number.isFinite(elapsed) || elapsed <= 0) return;
  let remaining = Math.min(elapsed, .05);
  while (remaining > 0 && run.status === 'playing') {
    const dt = Math.min(remaining, 1 / 120); remaining -= dt; run.time += dt;
    if (run.grounded) run.coyote = .1; else run.coyote = Math.max(0, run.coyote - dt);
    if (run.jumpBuffer > 0 && run.coyote > 0) { run.vy = -TRACE_PHYSICS.jump; run.grounded = false; run.coyote = 0; run.jumpBuffer = 0; }
    run.jumpBuffer = Math.max(0, run.jumpBuffer - dt);
    const oldY = run.y;
    run.x += TRACE_PHYSICS.speed * dt;
    run.vy += TRACE_PHYSICS.gravity * dt;
    run.y += run.vy * dt;
    run.grounded = false;
    if (run.vy >= 0) {
      const platform = level.platforms.find((p) => run.x + TRACE_PHYSICS.playerHalfWidth > p.x && run.x - TRACE_PHYSICS.playerHalfWidth < p.x + p.width && oldY <= p.y + .5 && run.y >= p.y);
      if (platform) { run.y = platform.y; run.vy = 0; run.grounded = true; }
    }
    if (run.y > 580) run.status = 'lost';
    else if (run.x >= level.finish && run.grounded) run.status = 'won';
  }
}
