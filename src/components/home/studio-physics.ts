export type StudioBody = { x: number; y: number; vx: number; vy: number; angle: number; spin: number; size: number; label: string };
const words = ['IDEA', 'WOW', 'FORMA', 'LATECH', 'DISEÑO', 'TU MARCA', '↗', '✳', 'A', 'L'];
export function createStudioBodies(width: number, height: number): StudioBody[] {
  return words.map((label, i) => ({ x: width * (.16 + (i % 4) * .22), y: height * (.2 + Math.floor(i / 4) * .28), vx: (i % 2 ? 1 : -1) * (16 + i * 4), vy: (i % 3 - 1) * 18, angle: (i % 3 - 1) * .18, spin: (i % 2 ? 1 : -1) * .12, size: Math.min(40, width / 14), label }));
}
export function stepStudioBodies(bodies: StudioBody[], width: number, height: number, dt: number, gravity: boolean, held = -1) {
  const seconds = Math.max(0, Math.min(.034, dt));
  bodies.forEach((body, i) => {
    if (i === held) return;
    body.vy += gravity ? 180 * seconds : 0;
    body.x += body.vx * seconds; body.y += body.vy * seconds;
    body.angle += body.spin * seconds;
    const xPad = body.size * 1.8, yPad = body.size;
    if (body.x < xPad || body.x > width - xPad) { body.x = Math.min(width - xPad, Math.max(xPad, body.x)); body.vx *= -.8; }
    if (body.y < yPad || body.y > height - yPad) { body.y = Math.min(height - yPad, Math.max(yPad, body.y)); body.vy *= -.75; }
  });
  // Ten pieces, bounded pairwise collisions. No physics engine or background worker.
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
    const a = bodies[i], b = bodies[j];
    const dx = b.x - a.x, dy = b.y - a.y;
    const overlapX = (a.size + b.size) * 1.65 - Math.abs(dx);
    const overlapY = (a.size + b.size) * .75 - Math.abs(dy);
    if (overlapX <= 0 || overlapY <= 0) continue;
    const heldA = i === held, heldB = j === held;
    const axis = overlapX < overlapY ? 'x' : 'y';
    const speed = axis === 'x' ? 'vx' : 'vy';
    const direction = Math.sign(axis === 'x' ? dx : dy) || 1;
    const overlap = axis === 'x' ? overlapX : overlapY;
    if (!heldA) a[axis] -= direction * overlap * (heldB ? 1 : .5);
    if (!heldB) b[axis] += direction * overlap * (heldA ? 1 : .5);
    const relative = (b[speed] - a[speed]) * direction;
    if (relative < 0) {
      const impulse = relative * .85;
      if (!heldA) a[speed] += impulse * direction;
      if (!heldB) b[speed] -= impulse * direction;
    }
  }
  bodies.forEach((body, i) => {
    if (i === held) return;
    body.x = Math.max(body.size * 1.8, Math.min(width - body.size * 1.8, body.x));
    body.y = Math.max(body.size, Math.min(height - body.size, body.y));
  });
}
