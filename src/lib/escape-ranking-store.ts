import { createClient, type Client } from '@libsql/client';
import type { EscapeCategory, EscapeEntry, EscapeRankingStore, EscapeRun, StoredEscapeEntry } from './escape-ranking';

// No runtime DDL. The additive schema must be provisioned explicitly in the
// target environment; unavailable storage leaves local gameplay usable.
export function createEscapeRankingStore(client: Client): EscapeRankingStore {
  return {
    async createRun(run: EscapeRun) {
      await client.execute({ sql: 'INSERT INTO escape_runs (id, token_hash, mode, difficulty, rules_version, started_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)', args: [run.id, run.tokenHash, run.mode, run.difficulty, run.rulesVersion, run.startedAt, run.expiresAt] });
    },
    async getRun(id: string) {
      const { rows } = await client.execute({ sql: 'SELECT id, token_hash, mode, difficulty, rules_version, started_at, expires_at FROM escape_runs WHERE id = ? LIMIT 1', args: [id] });
      const row = rows[0];
      return row ? { id: String(row.id), tokenHash: String(row.token_hash), mode: row.mode as EscapeRun['mode'], difficulty: row.difficulty as EscapeRun['difficulty'], rulesVersion: String(row.rules_version), startedAt: Number(row.started_at), expiresAt: Number(row.expires_at) } : null;
    },
    async getResult(id: string) {
      const { rows } = await client.execute({ sql: 'SELECT run_id, name, score, duration_ms, created_at FROM escape_results WHERE run_id = ? LIMIT 1', args: [id] });
      const row = rows[0];
      return row ? { id: String(row.run_id), name: String(row.name), score: Number(row.score), durationMs: Number(row.duration_ms), createdAt: Number(row.created_at) } : null;
    },
    async insertResult(entry: StoredEscapeEntry) {
      const response = await client.execute({ sql: 'INSERT INTO escape_results (run_id, name, score, duration_ms, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(run_id) DO NOTHING', args: [entry.id, entry.name, entry.score, entry.durationMs, entry.createdAt] });
      return response.rowsAffected === 1;
    },
    async top(category: EscapeCategory, rulesVersion: string): Promise<EscapeEntry[]> {
      const { rows } = await client.execute({ sql: 'SELECT r.run_id, r.name, r.score, r.duration_ms FROM escape_results r JOIN escape_runs s ON s.id = r.run_id WHERE s.mode = ? AND s.difficulty = ? AND s.rules_version = ? ORDER BY r.score DESC, r.duration_ms ASC, r.created_at ASC LIMIT 20', args: [category.mode, category.difficulty, rulesVersion] });
      return rows.map((row) => ({ id: String(row.run_id), name: String(row.name), score: Number(row.score), durationMs: Number(row.duration_ms) }));
    },
  };
}

let store: EscapeRankingStore | undefined;
export function escapeRankingStore(): EscapeRankingStore {
  if (!store) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error('Ranking storage is unavailable');
    store = createEscapeRankingStore(createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }));
  }
  return store;
}
