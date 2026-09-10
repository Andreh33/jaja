import { track } from '@vercel/analytics';

type GameId = 'runner' | 'escape' | 'trazo';
type Category = { mode: 'campana' | 'infinito'; difficulty: 'facil' | 'normal'; practice?: boolean };
/** Only discrete, allowlisted values. Never send drawings, tokens, aliases or URLs. */
export function trackLabGameStart(game: GameId, category?: Category) {
  try { track('lab_game_start', { game, ...category }); } catch { /* Optional analytics never stops a game. */ }
}
export function trackTraceEvent(event: 'trace_created' | 'trace_finish' | 'trace_share_intent') {
  try { track(event, { game: 'trazo' }); } catch { /* Optional analytics. */ }
}
export function trackSharedTraceOpen(valid: boolean) {
  try { track('trace_shared_open', { valid }); } catch { /* Optional analytics. */ }
}
