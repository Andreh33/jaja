-- Additive Escape v2 schema. No legacy data is rewritten or removed.
-- Apply only to an explicitly reviewed target. Runtime API handlers never run DDL.
CREATE TABLE IF NOT EXISTS escape_runs (
  id TEXT PRIMARY KEY NOT NULL,
  token_hash TEXT NOT NULL,
  mode TEXT NOT NULL CONSTRAINT escape_runs_mode CHECK (mode IN ('campana', 'infinito')),
  difficulty TEXT NOT NULL CONSTRAINT escape_runs_difficulty CHECK (difficulty IN ('facil', 'normal')),
  rules_version TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  CONSTRAINT escape_runs_expiration CHECK (expires_at > started_at)
);
CREATE INDEX IF NOT EXISTS escape_runs_category ON escape_runs (mode, difficulty, rules_version);
CREATE INDEX IF NOT EXISTS escape_runs_expiry ON escape_runs (expires_at);
CREATE TABLE IF NOT EXISTS escape_results (
  run_id TEXT PRIMARY KEY NOT NULL REFERENCES escape_runs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score INTEGER NOT NULL CONSTRAINT escape_results_score CHECK (score BETWEEN 0 AND 100000),
  duration_ms INTEGER NOT NULL CONSTRAINT escape_results_duration CHECK (duration_ms BETWEEN 0 AND 1800000),
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS escape_results_order ON escape_results (score, duration_ms, created_at);
