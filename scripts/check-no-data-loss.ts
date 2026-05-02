/**
 * Red de seguridad: ejecuta `drizzle-kit push --strict --verbose` en
 * dry-run y aborta si el plan incluye CREATE TABLE `__new_*` (patrón
 * de "alter via recreate" de SQLite que destruye datos si se aplica
 * por error con un drift falso).
 *
 * Causa documentada: drizzle-kit 0.31.x tiene un bug abierto
 * (drizzle-team/drizzle-orm#4574) por el que `check()` con placeholders
 * `${t.column}` triggea recreación cíclica espuria. Mientras no haya
 * fix upstream, este escudo bloquea cualquier `db:push` peligroso.
 *
 * Uso automático: predb:push hook (encadenado tras verify-uniques).
 * Uso manual: `npx tsx scripts/check-no-data-loss.ts`
 *
 * Si necesitas forzar un push genuino que recrea tablas (raro), lanza
 * directamente `npx drizzle-kit push` saltándote el hook — pero solo
 * tras auditar el plan a mano y haber hecho snapshot de Turso.
 */

import { spawnSync } from 'node:child_process';

function main() {
  const result = spawnSync('npx', ['drizzle-kit', 'push', '--strict', '--verbose'], {
    encoding: 'utf8',
    shell: true,
    input: 'n\n', // responde "n" al prompt interactivo si aparece
  });

  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  const combined = stdout + stderr;

  // Si drizzle-kit no detecta cambios, plan limpio.
  if (/No changes detected/.test(combined)) {
    console.log('[check-no-data-loss] ✓ drizzle-kit reports no changes. Push is safe.');
    process.exit(0);
  }

  // Buscar patrones destructivos en el plan.
  const newTablePattern = /CREATE TABLE\s+`?__new_[a-zA-Z_]+`?/g;
  const dropTablePattern = /DROP TABLE\s+`?[a-zA-Z_]+`?/g;
  const newMatches = combined.match(newTablePattern) ?? [];
  const dropMatches = combined.match(dropTablePattern) ?? [];

  if (newMatches.length > 0 || dropMatches.length > 0) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('  ABORTED: drizzle-kit plan includes destructive patterns.');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    if (newMatches.length > 0) {
      console.error(`  Found ${newMatches.length} CREATE TABLE \`__new_*\` patterns:`);
      const unique = Array.from(new Set(newMatches));
      for (const m of unique.slice(0, 10)) console.error(`    ${m}`);
      if (unique.length > 10) console.error(`    ... and ${unique.length - 10} more`);
    }
    if (dropMatches.length > 0) {
      console.error(`  Found ${dropMatches.length} DROP TABLE patterns:`);
      const unique = Array.from(new Set(dropMatches));
      for (const m of unique.slice(0, 10)) console.error(`    ${m}`);
    }
    console.error('');
    console.error('  This pattern recreates tables and may cause DATA LOSS.');
    console.error('  See docs/MIGRATION_NOTES.md → "Drift falso de drizzle-kit".');
    console.error('  Issue upstream: drizzle-team/drizzle-orm#4574');
    console.error('');
    console.error('  If this drift is genuine and intentional, run drizzle-kit');
    console.error('  push manually after taking a Turso snapshot.');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }

  // No "No changes detected" pero tampoco patrones destructivos: probablemente
  // un CREATE limpio (tabla nueva) o un CREATE INDEX. Permitir y avisar.
  console.log('[check-no-data-loss] ✓ Plan contains no destructive patterns. Push is safe.');
  process.exit(0);
}

main();
