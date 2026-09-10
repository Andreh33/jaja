/** Coarse route names: never send dynamic path values or query strings as event data. */
export function measurementPath(pathname: string): string | null {
  if (/^\/(admin|dashboard|cursos?|login|registro|recuperar|reset-password|checkout|pago|cuenta)(\/|$)/.test(pathname)) return null;
  const fixed = ['/', '/blog', '/lab', '/briefing', '/contacto', '/proyectos', '/sobre-nosotros', '/tienda', '/tienda/web', '/tienda/online', '/tienda/agente-ia', '/tienda/calculadora', '/cobertura'];
  if (fixed.includes(pathname)) return pathname;
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
    const publicSlug = /^\/(blog|lab|diseno-web|tienda-online|agente-ia|empleo)(\/[a-z0-9-]+){0,2}$/.test(url.pathname);
    if (!publicSlug && !['/', '/privacidad', '/terminos', '/empleo'].includes(url.pathname) && coarse !== url.pathname) url.pathname = '/otra-pagina-publica';
    return url.toString();
  } catch { return null; }
}
