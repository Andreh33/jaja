/** Authoritative turn-based games. Nothing here trusts a controller's score. */
export type Player = 0 | 1;
export type Winner = Player | 'draw' | 'team' | 'defeat' | null;
export type GameKind = 'naval' | 'space' | 'orbit';
type Base = { kind: GameKind; turn: Player; winner: Winner; moves: number; last: number; message: string };
export type NavalGame = Base & { kind: 'naval'; fleets: [number[], number[]]; shots: [number[], number[]] };
export type OrbitGame = Base & { kind: 'orbit'; grid: number[]; winning: number[] };
export type SpaceGame = Base & { kind: 'space'; enemies: { cell: number; hp: number }[]; level: number; hull: number; charge: [number, number]; scores: [number, number] };
export type ArcadeGame = NavalGame | OrbitGame | SpaceGame;
export type ArcadeView = Omit<NavalGame, 'fleets'> & { boards: [number[], number[]] } | OrbitGame | SpaceGame;
export class ArcadeRuleError extends Error {}
const other = (player: Player): Player => player === 0 ? 1 : 0;
function shuffled(size: number, random: () => number) { const cells = Array.from({ length: size }, (_, n) => n); for (let n = cells.length - 1; n > 0; n--) { const i = Math.floor(random() * (n + 1)); [cells[i], cells[n]] = [cells[n], cells[i]]; } return cells; }
function fleet(random: () => number) {
  const occupied = new Set<number>();
  for (const length of [4, 3, 3, 2, 2]) {
    const options = shuffled(128, random);
    let placed = false;
    for (const option of options) {
      const cell = option % 64; const vertical = option >= 64;
      if (vertical ? Math.floor(cell / 8) + length > 8 : cell % 8 + length > 8) continue;
      const cells = Array.from({ length }, (_, n) => cell + n * (vertical ? 8 : 1));
      if (cells.some(item => occupied.has(item))) continue;
      cells.forEach(item => occupied.add(item)); placed = true; break;
    }
    if (!placed) throw new ArcadeRuleError('No se pudo preparar la flota.');
  }
  return [...occupied];
}
function wave(level: number, random: () => number) {
  // Spawn above the danger rows, giving both pilots time to read the formation.
  return shuffled(24, random).slice(0, 2 + Math.ceil(level / 2)).map((cell, index) => ({ cell, hp: index === 0 && level % 5 === 0 ? 4 : level >= 6 && index < level - 5 ? 2 : 1 }));
}
export function newArcadeGame(kind: GameKind, random = Math.random): ArcadeGame {
  const base = { turn: 0 as Player, winner: null, moves: 0, last: -1, message: 'Jugador 1, te toca.' };
  if (kind === 'naval') return { ...base, kind, fleets: [fleet(random), fleet(random)], shots: [[], []], message: 'Flotas desplegadas. Busca al rival.' };
  if (kind === 'orbit') return { ...base, kind, grid: Array(42).fill(-1), winning: [] };
  return { ...base, kind, enemies: wave(1, random), level: 1, hull: 10, charge: [0, 0], scores: [0, 0], message: 'Misión 01 / Dos pilotos. Una galaxia.' };
}
function four(grid: number[], cell: number, player: Player) {
  for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    const line = [cell];
    for (const sign of [-1, 1]) for (let step = 1; step <= 3; step++) {
      const x = cell % 7 + dx * step * sign; const y = Math.floor(cell / 7) + dy * step * sign;
      if (x < 0 || x >= 7 || y < 0 || y >= 6 || grid[y * 7 + x] !== player) break;
      line.push(y * 7 + x);
    }
    if (line.length >= 4) return line;
  }
  return [];
}
export function arcadeMove(game: ArcadeGame, player: Player, cell: number, random = Math.random): ArcadeGame {
  if (game.winner !== null) throw new ArcadeRuleError('La partida ha terminado.');
  if (game.turn !== player) throw new ArcadeRuleError('Es el turno del otro jugador.');
  if (!Number.isInteger(cell)) throw new ArcadeRuleError('Movimiento no válido.');
  const next = structuredClone(game); next.moves++; next.last = cell; next.turn = other(player);
  if (next.kind === 'naval') {
    if (cell < 0 || cell >= 64 || next.shots[player].includes(cell)) throw new ArcadeRuleError('Elige una casilla sin explorar.');
    next.shots[player].push(cell);
    const hit = next.fleets[other(player)].includes(cell);
    next.message = hit ? `Jugador ${player + 1}: impacto confirmado.` : `Jugador ${player + 1}: agua. Cambia la señal.`;
    if (next.fleets[other(player)].every(item => next.shots[player].includes(item))) { next.winner = player; next.message = `Victoria del jugador ${player + 1}. Flota rival neutralizada.`; }
    return next;
  }
  if (next.kind === 'orbit') {
    if (cell < 0 || cell >= 7) throw new ArcadeRuleError('Elige una columna.');
    let landing = -1;
    for (let row = 5; row >= 0; row--) if (next.grid[row * 7 + cell] === -1) { landing = row * 7 + cell; break; }
    if (landing < 0) throw new ArcadeRuleError('Esa columna está llena.');
    next.grid[landing] = player; next.last = landing; next.winning = four(next.grid, landing, player);
    if (next.winning.length) next.winner = player;
    else if (!next.grid.includes(-1)) next.winner = 'draw';
    next.message = next.winner === 'draw' ? 'Equilibrio perfecto. Empate.' : next.winner !== null ? `Jugador ${player + 1}: cuatro en órbita.` : `Jugador ${next.turn + 1}, encuentra tu trayectoria.`;
    return next;
  }
  if (cell < -1 || cell >= 40) throw new ArcadeRuleError('Selecciona un objetivo o carga energía.');
  if (cell === -1) { next.charge[player] = Math.min(2, next.charge[player] + 1); next.message = `Piloto ${player + 1}: energía cargada.`; }
  else {
    const target = next.enemies.find(enemy => enemy.cell === cell);
    if (!target) throw new ArcadeRuleError('Selecciona una nave enemiga.');
    const charge = next.charge[player]; target.hp -= 1 + charge; next.charge[player] = 0;
    if (charge === 2) for (const enemy of next.enemies) if (enemy !== target && Math.abs(enemy.cell % 8 - cell % 8) + Math.abs(Math.floor(enemy.cell / 8) - Math.floor(cell / 8)) === 1) enemy.hp -= 2;
    const destroyed = next.enemies.filter(enemy => enemy.hp <= 0).length;
    next.enemies = next.enemies.filter(enemy => enemy.hp > 0); next.scores[player] += destroyed * 100 * next.level;
    next.message = charge === 2 ? `Piloto ${player + 1}: sobrecarga. ${destroyed} naves neutralizadas.` : target.hp <= 0 ? `Piloto ${player + 1}: nave neutralizada.` : 'Escudo enemigo tocado. Necesita otro impacto.';
  }
  if (!next.enemies.length) {
    if (next.level === 10) { next.winner = 'team'; next.message = 'Galaxia liberada. Diez misiones, dos pilotos, un equipo.'; }
    else { next.level++; next.hull = Math.min(10, next.hull + 2); next.enemies = wave(next.level, random); next.message = `Misión ${String(next.level).padStart(2, '0')} / Nueva oleada. Blindaje reparado.`; }
  } else if (next.moves % 2 === 0) {
    // Both pilots act before the enemy moves. No timing or latency advantage.
    next.enemies = next.enemies.map(enemy => ({ ...enemy, cell: enemy.cell + 8 }));
    const escaped = next.enemies.filter(enemy => enemy.cell >= 40).length;
    next.hull -= escaped;
    next.enemies = next.enemies.map(enemy => enemy.cell >= 40 ? { ...enemy, cell: enemy.cell % 8 } : enemy);
    if (escaped) next.message += ` Blindaje −${escaped}.`;
    if (next.hull <= 0) { next.hull = 0; next.winner = 'defeat'; next.message = 'La flota ha caído. Reinicia la misión y coordina los disparos.'; }
  }
  return next;
}
export function arcadeView(game: ArcadeGame, player: Player | null): ArcadeView {
  if (game.kind !== 'naval') return structuredClone(game);
  const { fleets, ...publicGame } = structuredClone(game);
  const boards = ([0, 1] as Player[]).map(owner => Array.from({ length: 64 }, (_, cell) => game.shots[other(owner)].includes(cell) ? (fleets[owner].includes(cell) ? 2 : 1) : player === owner && fleets[owner].includes(cell) ? 3 : 0)) as [number[], number[]];
  return { ...publicGame, boards };
}
