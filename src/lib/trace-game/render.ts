import type { TraceLevel } from './level';
import type { TraceRun } from './physics';

/** The same violet bean, eyes and orange accent as Latech's existing games. */
export function drawLatechBean(ctx: CanvasRenderingContext2D, x: number, y: number, phase: number, airborne: boolean) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#4c1d95';
  for (const side of [-1, 1]) { ctx.beginPath(); ctx.ellipse(side * 8, airborne ? 0 : Math.sin(phase + side) * 3, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); }
  const color = ctx.createRadialGradient(-8, -33, 2, 0, -22, 40);
  color.addColorStop(0, '#bfdbfe'); color.addColorStop(.45, '#3b82f6'); color.addColorStop(1, '#1e40af');
  ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(-17, -44, 34, 41, 16); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(5, -27, 12, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1e1035';
  for (const dx of [2, 10]) { ctx.beginPath(); ctx.ellipse(dx, -27, 2.3, 4, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#67c4ff'; ctx.beginPath(); ctx.roundRect(-17, -17, 34, 5, 2); ctx.fill(); ctx.restore();
}

export function renderTrace(ctx: CanvasRenderingContext2D, width: number, height: number, level: TraceLevel, run: TraceRun, overview = false, reduced = false) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#06101e'; ctx.fillRect(0, 0, width, height);
  const scale = overview ? Math.min(width / (level.finish + 90), height / 510) : height / 510;
  const viewWidth = width / scale;
  const camera = overview ? 0 : Math.max(0, Math.min(run.x - viewWidth * .23, level.finish - viewWidth + 90));
  ctx.save(); ctx.scale(scale, scale); ctx.translate(-camera, 0);
  ctx.strokeStyle = 'rgba(147,197,253,.07)'; ctx.lineWidth = 1;
  for (let x = Math.floor(camera / 80) * 80; x < camera + viewWidth; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 510); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(147,197,253,.23)'; ctx.lineWidth = 2; ctx.setLineDash([5, 9]); ctx.beginPath();
  level.platforms.forEach((p, i) => { const y = p.y - 100; if (i === 0) ctx.moveTo(p.x + p.width / 2, y); else ctx.lineTo(p.x + p.width / 2, y); }); ctx.stroke(); ctx.setLineDash([]);
  for (const [index, p] of level.platforms.entries()) {
    if (p.x + p.width < camera || p.x > camera + viewWidth) continue;
    const fill = ctx.createLinearGradient(0, p.y, 0, p.y + 105); fill.addColorStop(0, '#2b1749'); fill.addColorStop(1, 'rgba(43,23,73,0)');
    ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(p.x, p.y, p.width, 105, [7, 7, 0, 0]); ctx.fill();
    ctx.fillStyle = index % 5 === 0 ? '#67c4ff' : '#a78bfa'; ctx.beginPath(); ctx.roundRect(p.x, p.y, p.width, 5, 3); ctx.fill();
  }
  const end = level.platforms[level.platforms.length - 1];
  ctx.strokeStyle = '#c5eaff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(level.finish, end.y); ctx.lineTo(level.finish, end.y - 72); ctx.stroke();
  ctx.fillStyle = '#c5eaff'; ctx.beginPath(); ctx.moveTo(level.finish, end.y - 72); ctx.lineTo(level.finish + 28, end.y - 61); ctx.lineTo(level.finish, end.y - 50); ctx.fill();
  drawLatechBean(ctx, run.x, run.y, reduced ? 0 : run.time * 16, !run.grounded);
  ctx.restore();
}

export function renderTraceCard(ctx: CanvasRenderingContext2D, level: TraceLevel, seconds: number | null) {
  ctx.fillStyle = '#06101e'; ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = '#bfdbfe'; ctx.font = '600 22px sans-serif'; ctx.fillText('LATECH LAB / TU TRAZO, UN MUNDO', 64, 75);
  ctx.fillStyle = '#fff'; ctx.font = '700 62px sans-serif'; ctx.fillText('¿Llegas hasta el final?', 64, 163);
  const slice = document.createElement('canvas'); slice.width = 1072; slice.height = 300;
  const scene = slice.getContext('2d'); if (scene) { renderTrace(scene, 1072, 300, level, { x: 80, y: 330, vy: 0, grounded: true, coyote: 0, jumpBuffer: 0, time: 0, status: 'playing' }, true, true); ctx.drawImage(slice, 64, 206); }
  ctx.fillStyle = '#c8bddb'; ctx.font = '22px sans-serif'; ctx.fillText(seconds === null ? 'Un dibujo. Un nivel. Tu reto.' : `Recorrido completado en ${seconds.toFixed(1)} s`, 64, 525);
  ctx.fillStyle = '#67c4ff'; ctx.font = '600 22px sans-serif'; ctx.fillText('serviciosonlineweb.com/lab/trazo', 64, 582);
  ctx.fillStyle = '#9e8bb8'; ctx.font = '16px monospace'; ctx.fillText(level.token, 875, 582);
}
