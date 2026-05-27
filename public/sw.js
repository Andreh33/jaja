/*
 * Service worker mínimo de Latech.
 * Objetivo: cumplir los criterios de instalabilidad (manifest + SW con fetch)
 * y dar una pantalla offline básica. Sin push (fuera de alcance por ahora).
 */
const CACHE = 'latech-shell-v1';
const PRECACHE = ['/offline', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Navegaciones: red primero, con fallback a la página offline cacheada.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/offline')));
    return;
  }

  // Resto de GET: red, con fallback a cache si existe (no cacheamos de más).
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
