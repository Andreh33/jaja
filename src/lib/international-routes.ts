import articleRegistry from '@/content/international-article-routes.json';
export { articleRegistry };
export const locales = ['es', 'en', 'fr', 'de', 'pt', 'it'] as const;
export type Locale = typeof locales[number];
export const pageKeys = ['home', 'services', 'web', 'shop', 'ai', 'about', 'projects', 'contact', 'blog'] as const;
export type PageKey = typeof pageKeys[number];
export const routes: Record<Locale, Record<PageKey, string>> = {
  es: { home: '', services: '/tienda', web: '/tienda/web', shop: '/tienda/online', ai: '/tienda/agente-ia', about: '/sobre-nosotros', projects: '/proyectos', contact: '/contacto', blog: '/blog' },
  en: { home: '', services: '/services', web: '/services/web-design', shop: '/services/online-store', ai: '/services/ai-automation', about: '/about', projects: '/projects', contact: '/contact', blog: '/blog' },
  fr: { home: '', services: '/services', web: '/services/creation-site-web', shop: '/services/boutique-en-ligne', ai: '/services/automatisation-ia', about: '/studio', projects: '/projets', contact: '/contact', blog: '/blog' },
  de: { home: '', services: '/leistungen', web: '/leistungen/webdesign', shop: '/leistungen/onlineshop', ai: '/leistungen/ki-automatisierung', about: '/studio', projects: '/projekte', contact: '/kontakt', blog: '/blog' },
  pt: { home: '', services: '/servicos', web: '/servicos/web-design', shop: '/servicos/loja-online', ai: '/servicos/automacao-ia', about: '/estudio', projects: '/projetos', contact: '/contacto', blog: '/blog' },
  it: { home: '', services: '/servizi', web: '/servizi/realizzazione-siti-web', shop: '/servizi/negozio-online', ai: '/servizi/automazione-ia', about: '/studio', projects: '/progetti', contact: '/contatti', blog: '/blog' },
};
export function isLocale(value: string): value is Locale { return (locales as readonly string[]).includes(value); }
export function pagePath(locale: Locale, key: PageKey): string { return `${locale === 'es' ? '' : `/${locale}`}${routes[locale][key]}` || '/'; }

export function knownInternationalPath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  if (!isLocale(parts[0] ?? '') || parts[0] === 'es') return false;
  const locale = parts[0] as Locale;
  return pageKeys.some(key => pagePath(locale,key) === pathname) || articleRegistry.some(a => `${pagePath(locale, 'blog')}/${a.slugs[locale]}` === pathname);
}
