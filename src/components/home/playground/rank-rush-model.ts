export type RankRushMode = 'rush' | 'steady';
export type RankRushStatus = 'idle' | 'playing' | 'won' | 'over';

export const RANK_RUSH_SECONDS = 60;
export const RANK_RUSH_RESULTS = 6;

export type RankRushState = {
  mode: RankRushMode;
  status: RankRushStatus;
  progress: number;
  peak: number;
  elapsed: number;
  taps: number;
  lastTap: number;
  recentTaps: number[];
};

export function newRankRushState(mode: RankRushMode = 'rush'): RankRushState {
  return { mode, status: 'idle', progress: 0, peak: 0, elapsed: 0, taps: 0, lastTap: -1, recentTaps: [] };
}

export function startRankRush(mode: RankRushMode): RankRushState {
  return { ...newRankRushState(mode), status: 'playing' };
}

/** The summit requires more rhythm, but a human 5–6 taps/second can win. */
export function rankRushDecay(state: Pick<RankRushState, 'mode' | 'progress'>) {
  const climb = Math.max(0, Math.min(1, state.progress / 100));
  return state.mode === 'steady' ? 0.35 + 1.25 * climb ** 2 : 1.2 + 5.2 * climb ** 2;
}

export function rankRushTapGain(mode: RankRushMode) {
  return mode === 'steady' ? 2.8 : 1.35;
}

export function rankRushRequiredRate(state: Pick<RankRushState, 'mode' | 'progress'>) {
  return rankRushDecay(state) / rankRushTapGain(state.mode);
}

export function rankRushPosition(progress: number) {
  return Math.min(RANK_RUSH_RESULTS, Math.max(1, Math.ceil((100 - progress) / 20) + 1));
}

export function rankRushRate(state: RankRushState) {
  return state.recentTaps.filter((time) => time > state.elapsed - 1).length;
}

export function tapRankRush(state: RankRushState): RankRushState {
  if (state.status !== 'playing' || state.elapsed - state.lastTap < 0.055) return state;
  const progress = Math.min(100, state.progress + rankRushTapGain(state.mode));
  return {
    ...state,
    progress,
    peak: Math.max(state.peak, progress),
    taps: state.taps + 1,
    lastTap: state.elapsed,
    recentTaps: [...state.recentTaps.filter((time) => time > state.elapsed - 1), state.elapsed],
    status: progress >= 100 ? 'won' : 'playing',
  };
}

/** Only active game time enters the model. Pausing never consumes the clock. */
export function advanceRankRush(state: RankRushState, deltaSeconds: number): RankRushState {
  if (state.status !== 'playing' || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return state;
  const elapsed = Math.min(RANK_RUSH_SECONDS, state.elapsed + deltaSeconds);
  let remaining = elapsed - state.elapsed;
  let progress = state.progress;
  // Integrate the whole active delta. Slow devices get the same 60-second game.
  while (remaining > 0) {
    const step = Math.min(remaining, 1 / 120);
    progress = Math.max(0, progress - rankRushDecay({ ...state, progress }) * step);
    remaining -= step;
  }
  return {
    ...state,
    elapsed,
    progress,
    recentTaps: state.recentTaps.filter((time) => time > elapsed - 1),
    status: elapsed >= RANK_RUSH_SECONDS ? 'over' : 'playing',
  };
}
