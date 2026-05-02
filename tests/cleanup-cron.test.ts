/**
 * Tests del cron GDPR de limpieza de candidaturas.
 *
 * Mockeamos las 3 deps (selectExpired, deleteApplication, deleteBlob)
 * pasándolas directamente a runCleanup. NO tocamos @vercel/blob real
 * ni la BBDD.
 *
 * Run: npm test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runCleanup, RETENTION_DAYS, type CleanupCandidate, type CleanupDeps } from '../src/lib/jobs-cleanup';

function makeDeps(initial: CleanupCandidate[], opts?: { failBlobOnId?: string }) {
  const dbState = new Map(initial.map((c) => [c.id, c]));
  const blobDeletes: string[] = [];
  const dbDeletes: string[] = [];

  const deps: CleanupDeps = {
    selectExpired: async () => Array.from(dbState.values()),
    deleteApplication: async (id) => {
      dbState.delete(id);
      dbDeletes.push(id);
    },
    deleteBlob: async (url) => {
      const matchingId = initial.find((c) => c.cvBlobUrl === url)?.id;
      if (opts?.failBlobOnId && matchingId === opts.failBlobOnId) {
        throw new Error('mocked blob delete failure');
      }
      blobDeletes.push(url);
    },
  };

  return { deps, blobDeletes, dbDeletes, dbState };
}

describe('runCleanup', () => {
  it('case 1: no expired applications → returns zeros', async () => {
    const { deps } = makeDeps([]);
    const r = await runCleanup(deps);
    assert.deepEqual(r, { deletedApplications: 0, deletedCvs: 0, failedCvDeletes: 0 });
  });

  it('case 2: 3 expired applications → all deleted, both DB and Blob', async () => {
    const candidates: CleanupCandidate[] = [
      { id: 'a1', cvBlobUrl: 'https://blob.example/cv/a1.pdf' },
      { id: 'a2', cvBlobUrl: 'https://blob.example/cv/a2.pdf' },
      { id: 'a3', cvBlobUrl: 'https://blob.example/cv/a3.pdf' },
    ];
    const { deps, blobDeletes, dbDeletes, dbState } = makeDeps(candidates);

    const r = await runCleanup(deps);

    assert.deepEqual(r, { deletedApplications: 3, deletedCvs: 3, failedCvDeletes: 0 });
    assert.equal(blobDeletes.length, 3);
    assert.equal(dbDeletes.length, 3);
    assert.equal(dbState.size, 0);
  });

  it("case 3: 'contratado' applications are out of scope (selectExpired filters them)", async () => {
    // El filtro lo hace la query SQL en el endpoint (NOT IN ('contratado')).
    // Aquí simulamos que selectExpired ya devuelve solo los no-contratados.
    // El cron NO debería ver 'contratados' en absoluto.
    const candidates: CleanupCandidate[] = [
      { id: 'pendiente-vieja', cvBlobUrl: 'https://blob.example/cv/p.pdf' },
      // 'contratado' no aparece en initial → no se procesa.
    ];
    const { deps, blobDeletes, dbDeletes } = makeDeps(candidates);

    const r = await runCleanup(deps);

    assert.equal(r.deletedApplications, 1);
    assert.equal(blobDeletes.length, 1);
    assert.equal(dbDeletes.length, 1);
    assert.deepEqual(dbDeletes, ['pendiente-vieja']);
  });

  it('case 4: blob delete fails on one → continues with rest, counts failedCvDeletes', async () => {
    const candidates: CleanupCandidate[] = [
      { id: 'a1', cvBlobUrl: 'https://blob.example/cv/a1.pdf' },
      { id: 'a2-broken', cvBlobUrl: 'https://blob.example/cv/a2.pdf' },
      { id: 'a3', cvBlobUrl: 'https://blob.example/cv/a3.pdf' },
    ];
    const { deps, blobDeletes, dbDeletes } = makeDeps(candidates, { failBlobOnId: 'a2-broken' });

    const r = await runCleanup(deps);

    // 2 blobs OK, 1 fallo. Pero los 3 DB rows se borran (sí queremos limpiar
    // BBDD aunque el blob falle, evita filas huérfanas referenciando blobs perdidos).
    assert.equal(r.deletedApplications, 3);
    assert.equal(r.deletedCvs, 2);
    assert.equal(r.failedCvDeletes, 1);
    assert.equal(blobDeletes.length, 2);
    assert.equal(dbDeletes.length, 3);
    assert.ok(dbDeletes.includes('a2-broken'), 'broken-blob row should still be deleted from DB');
  });

  it('case 5: cutoff is now - RETENTION_DAYS days (defensive sanity)', async () => {
    let receivedCutoff = -1;
    const deps: CleanupDeps = {
      selectExpired: async (cutoff) => {
        receivedCutoff = cutoff;
        return [];
      },
      deleteApplication: async () => {},
      deleteBlob: async () => {},
    };
    const fixedNow = 1_800_000_000;
    await runCleanup(deps, fixedNow);
    const expected = fixedNow - RETENTION_DAYS * 24 * 60 * 60;
    assert.equal(receivedCutoff, expected);
  });
});
