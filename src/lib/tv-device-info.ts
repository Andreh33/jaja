import { createHmac } from 'node:crypto';
import type { TvDeviceInfo } from '../../drizzle/schema';
function label(value: string | null) {
  if (!value) return null;
  try { return decodeURIComponent(value).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 80) || null; } catch { return null; }
}
export function tvDeviceInfo(headers: Headers, trustedGeo = process.env.VERCEL === '1'): TvDeviceInfo {
  const ua = (headers.get('user-agent') || '').slice(0, 700);
  const browsers = [['Edge', /(?:Edg|EdgiOS|EdgA)\/(\d+)/], ['Opera', /OPR\/(\d+)/], ['Firefox', /(?:Firefox|FxiOS)\/(\d+)/], ['Chrome', /(?:Chrome|CriOS)\/(\d+)/], ['Safari', /Version\/(\d+).*Safari/]] as const;
  const browser = browsers.map(([name, regex]) => { const match = ua.match(regex); return match ? `${name} ${match[1]}` : null; }).find(Boolean) || 'Desconocido';
  return { browser, os: /iPhone|iPad|iPod/.test(ua) ? 'iOS / iPadOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Desconocido',
    device: /iPad|Tablet/.test(ua) ? 'Tablet' : /Mobile|iPhone|Android/.test(ua) ? 'Móvil' : 'Ordenador', country: trustedGeo ? label(headers.get('x-vercel-ip-country')) : null, city: trustedGeo ? label(headers.get('x-vercel-ip-city')) : null };
}
export function tvIpHash(headers: Headers) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('TV_REMOTE_SECRET_UNAVAILABLE');
  const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown';
  return createHmac('sha256', secret).update(`tv-remote:${ip.slice(0, 80)}`).digest('hex');
}
