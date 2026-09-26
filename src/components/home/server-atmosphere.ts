export const SERVER_POSTER = '/video/server-racks-mirrored-poster.webp';

/** Pick once per mount: resizing must not restart a decorative download. */
export function serverVideoSource(width: number, saveData = false, reduced = false) {
  if (saveData || reduced) return null;
  // The selected film is natively 1080p. Do not upscale it for high-DPI screens.
  return width < 768 ? '/video/server-racks-mirrored-720.mp4' : '/video/server-racks-mirrored-1080.mp4';
}
