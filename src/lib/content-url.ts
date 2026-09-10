/** URL allowlist shared by public Markdown, article covers and the editor API. */
export function isSafeContentUrl(value: string, image = false): boolean {
  if (!value || value !== value.trim() || value.includes('\\')) return false;
  let decoded = value;
  try { decoded = decodeURIComponent(value); } catch { return false; }
  if ([...decoded].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127) || decoded.includes('\\')) return false;
  if (value.startsWith('//') || decoded.startsWith('//')) return false;
  if (value.startsWith('#')) return !image;
  if (/^(?:https?):\/\//i.test(value)) {
    try { const url = new URL(value); return Boolean(url.hostname) && !url.username && !url.password && (!image || url.protocol === 'https:'); } catch { return false; }
  }
  if (!image && /^(mailto|tel):[^\s]+$/i.test(value)) return true;
  // Only unambiguous site-relative image paths; links may also use ./ or ../.
  if (value.startsWith('/')) return true;
  return !image && /^(\.\/|\.\.\/)/.test(value);
}
