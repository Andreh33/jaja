export const SERVER_POSTER = '/video/server-atmosphere-poster.webp';

/** Pick once per mount: resizing must not restart a decorative download. */
export function serverVideoSource(width: number, pixelRatio: number, saveData = false, reduced = false) {
  if (saveData || reduced) return null;
  if (width < 768) return '/video/server-atmosphere-720.mp4';
  return width * Math.min(Math.max(pixelRatio, 1), 2) >= 2560
    ? '/video/server-atmosphere-4k.mp4'
    : '/video/server-atmosphere-1080.mp4';
}
