/**
 * Rate limiter en memoria (suficiente para esta fase).
 *
 * Limitaciones conocidas:
 * - No persiste tras reinicio del proceso.
 * - No comparte estado entre instancias (en Vercel cada Function instance
 *   tiene su propio Map; con Fluid Compute esto es aceptable porque las
 *   instancias se reutilizan, pero NO es global).
 * - Para producción seria, migrar a Upstash Redis o similar.
 *
 * Estrategia: sliding window con timestamps por key.
 */

type Bucket = { hits: number[]; };

const buckets = new Map<string, Bucket>();

/**
 * @returns { allowed, remaining, resetMs } — `allowed` es false si superó el límite.
 */
export function rateLimit(
  key: string,
  options: { max: number; windowMs: number },
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const cutoff = now - options.windowMs;
  const bucket = buckets.get(key) || { hits: [] };

  // Purga timestamps fuera de ventana.
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= options.max) {
    const oldest = bucket.hits[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, options.windowMs - (now - oldest)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  // Garbage collection ligero: si el Map crece, purga keys vacías.
  if (buckets.size > 1000) {
    for (const [k, b] of buckets.entries()) {
      if (b.hits.length === 0 || b.hits[b.hits.length - 1] < cutoff) {
        buckets.delete(k);
      }
    }
  }

  return {
    allowed: true,
    remaining: options.max - bucket.hits.length,
    resetMs: options.windowMs,
  };
}

/**
 * Extrae IP del request (best effort, según headers de proxy/Vercel).
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}
