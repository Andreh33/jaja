/** Fixed-step local physics. The remote transports inputs, never coordinates. */
export type Platform = { x: number; y: number; w: number; h: number; brick?: boolean };
export type Runner = { x: number; y: number; vx: number; vy: number; facing: number; grounded: boolean; coyote: number; buffer: number; lastJump: boolean; invulnerable: number };
export type PlatformWorld = { level: number; title: string; width: number; platforms: Platform[]; coins: { x: number; y: number; taken: boolean }[]; enemies: { x: number; y: number; min: number; max: number; direction: number; dead: boolean; drone: boolean }[]; player: Runner; checkpoint: number; lives: number; score: number; time: number; camera: number; state: 'playing' | 'dead' | 'complete'; particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] };
export const PLATFORM_WIDTH = 1024; export const PLATFORM_HEIGHT = 576;
const W = 38; const H = 52;
const titles = ['El valle de las ideas', 'Jardines en el cielo', 'La ruta de los guardianes', 'Más allá del molde'];
export function newPlatformWorld(level = 1, score = 0, lives = 3): PlatformWorld {
  const platforms: Platform[] = [{ x: 0, y: 482, w: 620, h: 140 }];
  const coins: PlatformWorld['coins'] = []; const enemies: PlatformWorld['enemies'] = [];
  let x = 690;
  for (let n = 0; n < 14; n++) {
    const y = [455, 390, 450, 360, 420, 480, 400][(n + level - 1) % 7]; const w = n % 3 === 0 ? 280 : 210;
    platforms.push({ x, y, w, h: 85 });
    for (let c = 0; c < 3; c++) coins.push({ x: x + 40 + c * 56, y: y - 70, taken: false });
    if (n % 3 === 1) { platforms.push({ x: x + 60, y: y - 125, w: 100, h: 34, brick: true }); coins.push({ x: x + 108, y: y - 180, taken: false }); }
    if (n > 1 && n % (level < 3 ? 3 : 2) === 0) enemies.push({ x: x + 80, y: y - 34, min: x + 8, max: x + w - 46, direction: 1, dead: false, drone: level >= 3 && n % 4 === 0 });
    x += w + 75 + Math.min(level * 10, 35);
  }
  platforms.push({ x, y: 465, w: 520, h: 150 });
  return { level, title: titles[level - 1] || titles[3], width: x + 520, platforms, coins, enemies,
    player: { x: 100, y: 400, vx: 0, vy: 0, facing: 1, grounded: false, coyote: 0, buffer: 0, lastJump: false, invulnerable: 0 },
    checkpoint: 0, lives, score, time: 0, camera: 0, state: 'playing', particles: [] };
}
function burst(world: PlatformWorld, x: number, y: number, color: string) { for (let n = 0; n < 12; n++) { const a = n * Math.PI / 6; world.particles.push({ x, y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110 - 80, life: .7, color }); } }
function hurt(world: PlatformWorld) {
  if (world.player.invulnerable > 0) return;
  world.lives--; burst(world, world.player.x + 20, world.player.y + 25, '#ff9560');
  if (world.lives <= 0) { world.state = 'dead'; return; }
  const safe = world.platforms[world.checkpoint]; Object.assign(world.player, { x: safe.x + 25, y: safe.y - H - 10, vx: 0, vy: 0, invulnerable: 2, grounded: false });
}
export function stepPlatform(world: PlatformWorld, input: number, dt: number) {
  dt = Math.min(Math.max(dt, 0), 1 / 30);
  if (world.state !== 'playing') return;
  world.time += dt; const p = world.player; const previousY = p.y;
  const jump = !!(input & 4); const direction = (input & 2 ? 1 : 0) - (input & 1 ? 1 : 0);
  p.invulnerable = Math.max(0, p.invulnerable - dt);
  p.coyote = p.grounded ? .11 : Math.max(0, p.coyote - dt);
  p.buffer = jump && !p.lastJump ? .13 : Math.max(0, p.buffer - dt); p.lastJump = jump;
  const target = direction * (input & 8 ? 420 : 290); const acceleration = direction ? 2300 : 2000;
  p.vx += Math.sign(target - p.vx) * Math.min(Math.abs(target - p.vx), acceleration * dt);
  if (direction) p.facing = direction;
  if (p.buffer > 0 && p.coyote > 0) { p.vy = -660; p.buffer = 0; p.coyote = 0; p.grounded = false; burst(world, p.x + 20, p.y + H, '#d7fbff'); }
  if (!jump && p.vy < -280) p.vy += 1800 * dt;
  p.vy = Math.min(900, p.vy + 1650 * dt); p.x = Math.max(0, Math.min(world.width - W, p.x + p.vx * dt)); p.y += p.vy * dt;
  p.grounded = false;
  for (const [index, platform] of world.platforms.entries()) {
    if (p.x + W <= platform.x || p.x >= platform.x + platform.w) continue;
    if (p.vy >= 0 && previousY + H <= platform.y + 4 && p.y + H >= platform.y) {
      p.y = platform.y - H; p.vy = 0; p.grounded = true;
      if (!platform.brick && index > world.checkpoint && index % 4 === 0) world.checkpoint = index;
    } else if (platform.brick && p.vy < 0 && previousY >= platform.y + platform.h && p.y <= platform.y + platform.h) { p.y = platform.y + platform.h; p.vy = 80; }
  }
  for (const coin of world.coins) if (!coin.taken && Math.hypot(p.x + W / 2 - coin.x, p.y + H / 2 - coin.y) < 42) { coin.taken = true; world.score += 50; burst(world, coin.x, coin.y, '#ffda56'); }
  for (const enemy of world.enemies) {
    if (enemy.dead) continue;
    enemy.x += enemy.direction * (55 + world.level * 12) * dt;
    if (enemy.x > enemy.max) { enemy.x = enemy.max; enemy.direction = -1; } if (enemy.x < enemy.min) { enemy.x = enemy.min; enemy.direction = 1; }
    if (p.x + W > enemy.x && p.x < enemy.x + 36 && p.y + H > enemy.y && p.y < enemy.y + 34) {
      if (p.vy > 0 && previousY + H < enemy.y + 17) { enemy.dead = true; p.vy = -440; world.score += 200; burst(world, enemy.x + 18, enemy.y, '#fdad46'); }
      else hurt(world);
    }
  }
  if (p.y > 680) { p.invulnerable = 0; hurt(world); }
  if (p.x > world.width - 200 && p.y < 520) { world.state = 'complete'; world.score += 1000; burst(world, p.x, p.y, '#7cf4ff'); }
  const targetCamera = Math.max(0, Math.min(world.width - PLATFORM_WIDTH, p.x - 330)); world.camera += (targetCamera - world.camera) * (1 - Math.exp(-8 * dt));
  world.particles = world.particles.filter(item => item.life > 0);
  for (const item of world.particles) { item.x += item.vx * dt; item.y += item.vy * dt; item.vy += 250 * dt; item.life -= dt; }
}
