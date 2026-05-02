/**
 * Lógica del cron de retención GDPR para candidaturas.
 *
 * Reglas:
 *   - Candidaturas con `status != 'contratado'` y `created_at` con
 *     más de 30 días → se borran (BBDD) y se elimina el CV en Blob.
 *   - Candidaturas con `status = 'contratado'` se conservan
 *     indefinidamente (es persona empleada).
 *   - Si el delete del blob falla, log warning y CONTINÚA con el
 *     borrado en BBDD (un blob huérfano no bloquea la limpieza).
 *
 * Diseño: la función `runCleanup` recibe `deps` para que los tests
 * puedan mockear DB y Blob sin tocar nada real.
 */

export type CleanupCandidate = {
  id: string;
  cvBlobUrl: string;
};

export type CleanupResult = {
  deletedApplications: number;
  deletedCvs: number;
  failedCvDeletes: number;
};

export type CleanupDeps = {
  selectExpired: (cutoffSeconds: number) => Promise<CleanupCandidate[]>;
  deleteApplication: (id: string) => Promise<void>;
  deleteBlob: (url: string) => Promise<void>;
};

export const RETENTION_DAYS = 30;

export async function runCleanup(deps: CleanupDeps, nowSeconds?: number): Promise<CleanupResult> {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  const cutoff = now - RETENTION_DAYS * 24 * 60 * 60;
  const expired = await deps.selectExpired(cutoff);

  let deletedApplications = 0;
  let deletedCvs = 0;
  let failedCvDeletes = 0;

  for (const app of expired) {
    // 1. Intenta borrar el blob. Best-effort.
    try {
      await deps.deleteBlob(app.cvBlobUrl);
      deletedCvs++;
    } catch (err) {
      failedCvDeletes++;
      console.warn(
        `[cleanup-applications] blob delete failed id=${app.id} url=${app.cvBlobUrl} err="${(err as Error).message}"`,
      );
    }

    // 2. Borra la fila de BBDD.
    try {
      await deps.deleteApplication(app.id);
      deletedApplications++;
    } catch (err) {
      console.error(
        `[cleanup-applications] db delete failed id=${app.id} err="${(err as Error).message}"`,
      );
    }
  }

  return { deletedApplications, deletedCvs, failedCvDeletes };
}
