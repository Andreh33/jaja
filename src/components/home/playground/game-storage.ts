/** Storage can be disabled, full or corrupted. Games must remain playable. */
export const gameStorage = {
  getItem(key: string): string | null {
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  setItem(key: string, value: string): boolean {
    try { window.localStorage.setItem(key, value); return true; } catch { return false; }
  },
  removeItem(key: string): boolean {
    try { window.localStorage.removeItem(key); return true; } catch { return false; }
  },
};

export function readGameNumber(key: string, fallback = 0, maximum = 1_000_000) {
  const raw = gameStorage.getItem(key);
  const value = raw === null ? fallback : Number(raw);
  return Number.isFinite(value) && value >= 0 ? Math.min(Math.floor(value), maximum) : fallback;
}
