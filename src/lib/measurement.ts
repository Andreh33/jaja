import { knownInternationalPath, isLocale, pagePath } from './international-routes';
/** Public article slugs and coarse routes; never private values or query strings. */
export function measurementPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  const publicParts = isLocale(parts[0] ?? '') ? parts.slice(1) : parts;
  if (['admin', 'dashboard', 'api', 'login', 'checkout', 'registro', 'recuperar', 'reset-password', 'cuenta', 'mando', 'pago'].includes(publicParts[0])) return null;
  if (knownInternationalPath(pathname)) return pathname;
  if (/^\/(admin|dashboard|cursos?|login|registro|recuperar|reset-password|checkout|pago|cuenta|mando)(\/|$)/.test(pathname)) return null;
  const fixed = ['/', '/blog', '/lab', '/briefing', '/contacto', '/proyectos', '/sobre-nosotros', '/tienda', '/tienda/web', '/tienda/online', '/tienda/agente-ia', '/tienda/calculadora', '/cobertura'];
  if (fixed.includes(pathname)) return pathname;
  if (/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname)) return pathname;
  if (pathname.startsWith('/blog/')) return '/blog/articulo';
  if (pathname.startsWith('/lab/')) return '/lab/experimento';
  if (/^\/(diseno-web|tienda-online|agente-ia)\//.test(pathname)) return '/cobertura/servicio';
  return '/otra-pagina-publica';
}
export function contactChannel(href: string): 'telefono' | 'email' | 'whatsapp' | null {
  if (href.startsWith('tel:')) return 'telefono';
  if (href.startsWith('mailto:')) return 'email';
  try {
    const url = new URL(href);
    if (url.protocol === 'https:' && ['wa.me', 'api.whatsapp.com'].includes(url.hostname)) return 'whatsapp';
  } catch { /* Not an absolute contact URL. */ }
  return null;
}

export function commercialDestination(href: string, origin: string): string | null {
  try {
    const url = new URL(href, origin);
    if (url.origin !== origin) return null;
    const locale = url.pathname.split('/')[1];
    if (isLocale(locale) && locale !== 'es' && (['services', 'web', 'shop', 'ai', 'contact'] as const).some(key => pagePath(locale, key) === url.pathname)) return url.pathname;
    return ['/tienda', '/tienda/web', '/tienda/online', '/tienda/agente-ia', '/tienda/calculadora', '/contacto', '/briefing'].includes(url.pathname) ? url.pathname : null;
  } catch { return null; }
}

/** The SDK also attaches the current URL to events: remove shared levels,
 * searches and form parameters, and exclude authenticated/private areas. */
export function sanitizeMeasurementUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const coarse = measurementPath(url.pathname);
    if (!coarse || url.pathname.startsWith('/api/')) return null;
    url.search = '';
    url.hash = '';
    const publicSlug = knownInternationalPath(url.pathname) || /^\/(blog|lab|diseno-web|tienda-online|agente-ia|empleo)(\/[a-z0-9-]+){0,2}$/.test(url.pathname);
    if (!publicSlug && !['/', '/privacidad', '/terminos', '/empleo'].includes(url.pathname) && coarse !== url.pathname) url.pathname = '/otra-pagina-publica';
    return url.toString();
  } catch { return null; }
}
