/** Fixed-step local physics. The remote transports inputs, never coordinates. */
export type Platform = { x: number; y: number; w: number; h: number; brick?: boolean; checkpoint?: boolean; baseY?: number; travel?: number; phase?: number; spring?: boolean };
export type Runner = { x: number; y: number; vx: number; vy: number; facing: number; grounded: boolean; coyote: number; buffer: number; lastJump: boolean; invulnerable: number; airJumps: number; shield: number; dash: number; dashCooldown: number; lastDash: boolean };
export type PlatformEvent = { id: number; kind: 'jump' | 'coin' | 'hit' | 'checkpoint' | 'power' | 'finish' | 'dash'; x: number; y: number; text: string; life: number };
export type PlatformWorld = {
  level: number; title: string; width: number; platforms: Platform[];
  coins: { x: number; y: number; taken: boolean }[]; cores: { x: number; y: number; taken: boolean }[]; relics: { x: number; y: number; taken: boolean }[];
  enemies: { x: number; y: number; min: number; max: number; direction: number; dead: boolean; drone: boolean }[];
  player: Runner; players: Runner[]; checkpoint: number; lives: number; score: number; time: number; camera: number;
  state: 'playing' | 'dead' | 'complete'; waiting: boolean; combo: number; comboTime: number; coinsCollected: number;
  events: PlatformEvent[]; eventId: number;
  particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[];
};
export const PLATFORM_WIDTH = 1024;
export const PLATFORM_HEIGHT = 576;
const W = 38; const H = 52;
const titles = ['El valle de las ideas', 'Jardines en el cielo', 'La ruta de los guardianes', 'Más allá del molde'];
function runner(x = 100, y = 400): Runner { return { x, y, vx: 0, vy: 0, facing: 1, grounded: false, coyote: 0, buffer: 0, lastJump: false, invulnerable: 0, airJumps: 1, shield: 0, dash: 0, dashCooldown: 0, lastDash: false }; }
export function newPlatformWorld(level = 1, score = 0, lives = 3): PlatformWorld {
  const platforms: Platform[] = [{ x: 0, y: 482, w: 620, h: 140, checkpoint: true }];
  const coins: PlatformWorld['coins'] = []; const cores: PlatformWorld['cores'] = []; const relics: PlatformWorld['relics'] = []; const enemies: PlatformWorld['enemies'] = [];
  let x = 690;
  for (let n = 0; n < 14; n++) {
    const y = [455, 390, 450, 360, 420, 480, 400][(n + level - 1) % 7]; const w = n % 3 === 0 ? 280 : 210;
    platforms.push({ x, y, w, h: 85, checkpoint: n % 4 === 3 });
    for (let c = 0; c < 3; c++) coins.push({ x: x + 40 + c * 56, y: y - 70, taken: false });
    if (n % 3 === 1) { platforms.push({ x: x + 60, y: y - 125, w: 100, h: 34, brick: true }); coins.push({ x: x + 108, y: y - 180, taken: false }); }
    if (n % 4 === 2) cores.push({ x: x + w / 2, y: y - 110, taken: false });
    if (n % 4 === 1) {
      platforms.push({ x: x + w - 25, y: y - 100, baseY: y - 100, travel: 32, phase: n, w: 95, h: 25, brick: true });
      relics.push({ x: x + w + 10, y: y - 220, taken: false });
    }
    if (n === 4 || n === 10) platforms.push({ x: x + 40, y: y - 8, w: 48, h: 12, spring: true });
    if (n > 1 && n % (level < 3 ? 3 : 2) === 0) enemies.push({ x: x + 80, y: y - 34, min: x + 8, max: x + w - 46, direction: 1, dead: false, drone: level >= 3 && n % 4 === 0 });
    x += w + 75 + Math.min(level * 10, 35);
  }
  platforms.push({ x, y: 465, w: 520, h: 150 });
  const player = runner();
  return { level, title: titles[level - 1] || titles[3], width: x + 520, platforms, coins, cores, relics, enemies,
    player, players: [player], checkpoint: 0, lives, score, time: 0, camera: 0, state: 'playing', particles: [],
    waiting: false, combo: 0, comboTime: 0, coinsCollected: 0, events: [], eventId: 0 };
}
export function setPlatformCoop(world: PlatformWorld, enabled: boolean) {
  if (!enabled) { world.players.splice(1); return; }
  if (world.players.length === 2) return;
  const leader = world.player;
  const floor = world.platforms.find(p => leader.grounded && leader.x + W > p.x && leader.x < p.x + p.w && Math.abs(leader.y + H - p.y) < 2) || world.platforms[world.checkpoint];
  const partner = runner(Math.max(floor.x + 8, Math.min(floor.x + floor.w - W - 8, leader.x - 55)), floor.y - H);
  partner.grounded = true; partner.invulnerable = 2; world.players.push(partner);
}
function burst(world: PlatformWorld, x: number, y: number, color: string) {
  for (let n = 0; n < 12; n++) { const a = n * Math.PI / 6; world.particles.push({ x, y, vx: Math.cos(a) * 110, vy: Math.sin(a) * 110 - 80, life: .7, color }); }
}
function event(world: PlatformWorld, kind: PlatformEvent['kind'], x: number, y: number, text = '') {
  world.events.push({ id: ++world.eventId, kind, x, y, text, life: kind === 'checkpoint' ? 2 : 1 });
}
function hurt(world: PlatformWorld, p: Runner) {
  if (p.invulnerable > 0 || world.state !== 'playing') return;
  world.lives--; world.combo = 0; world.comboTime = 0; burst(world, p.x + 20, p.y + 25, '#ff9560'); event(world, 'hit', p.x, p.y, '¡Otra oportunidad!');
  if (world.lives <= 0) { world.state = 'dead'; return; }
  const safe = world.platforms[world.checkpoint];
  Object.assign(p, runner(safe.x + 25 + world.players.indexOf(p) * 55, safe.y - H - 10), { invulnerable: 2 });
}
export function stepPlatform(world: PlatformWorld, input: number | readonly [number, number], dt: number) {
  dt = Math.min(Math.max(dt, 0), 1 / 30);
  if (world.state !== 'playing') return;
  world.time += dt; world.comboTime = Math.max(0, world.comboTime - dt); if (!world.comboTime) world.combo = 0;
  for (const platform of world.platforms) if (platform.baseY !== undefined) {
    const oldY = platform.y;
    platform.y = platform.baseY + Math.sin(world.time * 1.4 + (platform.phase || 0)) * (platform.travel || 0);
    for (const p of world.players) if (p.grounded && Math.abs(p.y + H - oldY) < 2 && p.x + W > platform.x && p.x < platform.x + platform.w) p.y += platform.y - oldY;
  }
  for (const enemy of world.enemies) {
    if (enemy.dead) continue;
    enemy.x += enemy.direction * (55 + world.level * 12) * dt;
    if (enemy.x > enemy.max) { enemy.x = enemy.max; enemy.direction = -1; }
    if (enemy.x < enemy.min) { enemy.x = enemy.min; enemy.direction = 1; }
  }
  for (const [slot, p] of world.players.entries()) {
    const mask = typeof input === 'number' ? slot === 0 ? input : 0 : input[slot];
    const previousY = p.y; const jump = !!(mask & 4); const pressed = jump && !p.lastJump;
    const direction = (mask & 2 ? 1 : 0) - (mask & 1 ? 1 : 0);
    p.invulnerable = Math.max(0, p.invulnerable - dt); p.shield = Math.max(0, p.shield - dt);
    p.dash = Math.max(0, p.dash - dt); p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    if ((mask & 16) && !p.lastDash && p.dashCooldown === 0) { p.dash = .18; p.dashCooldown = 1.25; if (direction) p.facing = direction; p.vy = 0; event(world, 'dash', p.x, p.y); burst(world, p.x + 19, p.y + 26, '#b6ffff'); }
    p.lastDash = !!(mask & 16);
    p.coyote = p.grounded ? .11 : Math.max(0, p.coyote - dt);
    p.buffer = pressed ? .13 : Math.max(0, p.buffer - dt); p.lastJump = jump;
    const target = direction * (mask & 8 ? 420 : 290); const acceleration = direction ? 2300 : 2000;
    if (p.dash > 0) p.vx = p.facing * 720;
    else p.vx += Math.sign(target - p.vx) * Math.min(Math.abs(target - p.vx), acceleration * dt);
    if (direction) p.facing = direction;
    const groundJump = p.buffer > 0 && p.coyote > 0;
    const airJump = pressed && !p.grounded && p.coyote <= 0 && p.airJumps > 0;
    if (groundJump || airJump) {
      p.vy = groundJump ? -660 : -560; p.buffer = 0; p.coyote = 0; p.grounded = false;
      if (airJump) p.airJumps--; burst(world, p.x + 20, p.y + H, slot ? '#ffbc6b' : '#a3f4ff'); event(world, 'jump', p.x, p.y);
    }
    if (!jump && p.vy < -280) p.vy += 1800 * dt;
    p.vy = p.dash > 0 ? 0 : Math.min(900, p.vy + 1650 * dt); p.x = Math.max(0, Math.min(world.width - W, p.x + p.vx * dt)); p.y += p.vy * dt; p.grounded = false;
    for (const [index, platform] of world.platforms.entries()) {
      if (p.x + W <= platform.x || p.x >= platform.x + platform.w) continue;
      if (p.vy >= 0 && previousY + H <= platform.y + 4 && p.y + H >= platform.y) {
        p.y = platform.y - H; p.vy = 0; p.grounded = true; p.airJumps = 1;
        if (platform.spring) { p.vy = -880; p.grounded = false; burst(world, p.x + 19, platform.y, '#ffb778'); event(world, 'jump', p.x, p.y, '¡IMPULSO!'); }
        if (platform.checkpoint && index > world.checkpoint) { world.checkpoint = index; event(world, 'checkpoint', platform.x + 30, platform.y - 100, 'PUNTO DE CONTROL'); burst(world, platform.x + 30, platform.y - 45, '#7cffee'); }
      } else if (platform.brick && p.vy < 0 && previousY >= platform.y + platform.h && p.y <= platform.y + platform.h) { p.y = platform.y + platform.h; p.vy = 80; }
    }
    for (const coin of world.coins) if (!coin.taken && Math.hypot(p.x + W / 2 - coin.x, p.y + H / 2 - coin.y) < 42) {
      coin.taken = true; world.coinsCollected++; world.combo++; world.comboTime = 2.5;
      const reward = 50 * Math.min(4, 1 + Math.floor((world.combo - 1) / 5)); world.score += reward;
      burst(world, coin.x, coin.y, '#ffda56'); event(world, 'coin', coin.x, coin.y, `+${reward}`);
      if (world.coinsCollected % 20 === 0) { world.lives = Math.min(6, world.lives + 1); event(world, 'power', p.x, p.y - 35, '+1 VIDA DE EQUIPO'); }
    }
    for (const core of world.cores) if (!core.taken && Math.hypot(p.x + W / 2 - core.x, p.y + H / 2 - core.y) < 40) {
      core.taken = true; p.shield = 8; world.score += 300; event(world, 'power', p.x, p.y - 35, 'ESCUDO · 8 SEGUNDOS'); burst(world, core.x, core.y, '#84f3ff');
    }
    for (const relic of world.relics) if (!relic.taken && Math.hypot(p.x + W / 2 - relic.x, p.y + H / 2 - relic.y) < 40) {
      relic.taken = true; world.score += 750; p.dashCooldown = 0; burst(world, relic.x, relic.y, '#ffb7f3'); event(world, 'power', relic.x, relic.y, 'RELIQUIA +750');
    }
    for (const enemy of world.enemies) {
      if (enemy.dead) continue;
      if (p.x + W > enemy.x && p.x < enemy.x + 36 && p.y + H > enemy.y && p.y < enemy.y + 34) {
        if (p.shield > 0 || p.dash > 0 || p.vy > 0 && previousY + H < enemy.y + 17) { enemy.dead = true; p.vy = p.dash > 0 ? 0 : -440; p.airJumps = 1; world.score += 200; burst(world, enemy.x + 18, enemy.y, '#fdad46'); event(world, 'coin', enemy.x, enemy.y, '+200'); }
        else hurt(world, p);
      }
    }
    if (p.y > 680) { p.invulnerable = 0; hurt(world, p); }
  }
  // Shared framing is a soft team boundary, not a camera that abandons player two.
  if (world.players.length === 2) {
    const [a, b] = world.players;
    if (Math.abs(a.x - b.x) > 790) { const leader = a.x > b.x ? a : b; const follower = leader === a ? b : a; leader.x = follower.x + 790; leader.vx = Math.min(0, leader.vx); }
  }
  const atFinish = world.players.map(p => p.x > world.width - 200 && p.y < 520);
  world.waiting = atFinish.some(Boolean) && !atFinish.every(Boolean);
  if (world.state === 'playing' && atFinish.every(Boolean)) { world.state = 'complete'; world.score += 1000; event(world, 'finish', world.player.x, world.player.y, '¡MUNDO COMPLETADO!'); burst(world, world.player.x, world.player.y, '#7cf4ff'); }
  const center = world.players.reduce((sum, p) => sum + p.x, 0) / world.players.length;
  const targetCamera = Math.max(0, Math.min(world.width - PLATFORM_WIDTH, center - (world.players.length === 2 ? 450 : 330)));
  world.camera += (targetCamera - world.camera) * (1 - Math.exp(-8 * dt));
  world.particles = world.particles.filter(item => item.life > 0);
  for (const item of world.particles) { item.x += item.vx * dt; item.y += item.vy * dt; item.vy += 250 * dt; item.life -= dt; }
  world.events = world.events.filter(item => (item.life -= dt) > 0);
}
