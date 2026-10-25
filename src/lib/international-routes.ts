import registry from '@/content/international-article-routes.json';
export const articleRegistry: { id: string; slugs: Partial<Record<Locale, string>> }[] = registry;
export const locales = ['es', 'en', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'sv', 'da', 'ro', 'us', 'latam'] as const;
export type Locale = typeof locales[number];
export const localeNames: Record<Locale, string> = { es: 'Español', en: 'English', fr: 'Français', de: 'Deutsch', pt: 'Português', it: 'Italiano', nl: 'Nederlands', pl: 'Polski', sv: 'Svenska', da: 'Dansk', ro: 'Română', us: 'English (US)', latam: 'Español (Latinoamérica)' };
export function htmlLanguage(locale: Locale): string { return locale === 'es' ? 'es-ES' : locale === 'us' ? 'en-US' : locale === 'latam' ? 'es-419' : locale; }
/** Google hreflang supports ISO country codes; numeric UN regions such as 419 are not supported. */
export function seoLanguage(locale: Locale): string { return locale === 'latam' ? 'es' : htmlLanguage(locale); }
export function contentLanguage(locale: Locale): string { return locale === 'us' ? 'en' : locale === 'latam' ? 'es' : locale; }
export const pageKeys = ['home', 'services', 'web', 'shop', 'ai', 'about', 'projects', 'contact', 'blog'] as const;
export type PageKey = typeof pageKeys[number];
export const routes: Record<Locale, Record<PageKey, string>> = {
  es: { home: '', services: '/tienda', web: '/tienda/web', shop: '/tienda/online', ai: '/tienda/agente-ia', about: '/sobre-nosotros', projects: '/proyectos', contact: '/contacto', blog: '/blog' },
  en: { home: '', services: '/services', web: '/services/web-design', shop: '/services/online-store', ai: '/services/ai-automation', about: '/about', projects: '/projects', contact: '/contact', blog: '/blog' },
  fr: { home: '', services: '/services', web: '/services/creation-site-web', shop: '/services/boutique-en-ligne', ai: '/services/automatisation-ia', about: '/studio', projects: '/projets', contact: '/contact', blog: '/blog' },
  de: { home: '', services: '/leistungen', web: '/leistungen/webdesign', shop: '/leistungen/onlineshop', ai: '/leistungen/ki-automatisierung', about: '/studio', projects: '/projekte', contact: '/kontakt', blog: '/blog' },
  pt: { home: '', services: '/servicos', web: '/servicos/web-design', shop: '/servicos/loja-online', ai: '/servicos/automacao-ia', about: '/estudio', projects: '/projetos', contact: '/contacto', blog: '/blog' },
  it: { home: '', services: '/servizi', web: '/servizi/realizzazione-siti-web', shop: '/servizi/negozio-online', ai: '/servizi/automazione-ia', about: '/studio', projects: '/progetti', contact: '/contatti', blog: '/blog' },
  nl: { home: '', services: '/diensten', web: '/diensten/webdesign', shop: '/diensten/webwinkel', ai: '/diensten/ai-automatisering', about: '/studio', projects: '/projecten', contact: '/contact', blog: '/blog' },
  pl: { home: '', services: '/uslugi', web: '/uslugi/strony-internetowe', shop: '/uslugi/sklep-internetowy', ai: '/uslugi/automatyzacja-ai', about: '/studio', projects: '/projekty', contact: '/kontakt', blog: '/blog' },
  sv: { home: '', services: '/tjanster', web: '/tjanster/webbdesign', shop: '/tjanster/webbutik', ai: '/tjanster/ai-automatisering', about: '/studio', projects: '/projekt', contact: '/kontakt', blog: '/blog' },
  da: { home: '', services: '/ydelser', web: '/ydelser/webdesign', shop: '/ydelser/webshop', ai: '/ydelser/ai-automatisering', about: '/studio', projects: '/projekter', contact: '/kontakt', blog: '/blog' },
  ro: { home: '', services: '/servicii', web: '/servicii/design-web', shop: '/servicii/magazin-online', ai: '/servicii/automatizare-ai', about: '/studio', projects: '/proiecte', contact: '/contact', blog: '/blog' },
  us: { home: '', services: '/services', web: '/services/web-design', shop: '/services/online-store', ai: '/services/ai-automation', about: '/about', projects: '/projects', contact: '/contact', blog: '/blog' },
  latam: { home: '', services: '/servicios', web: '/servicios/diseno-web', shop: '/servicios/tienda-online', ai: '/servicios/automatizacion-ia', about: '/estudio', projects: '/proyectos', contact: '/contacto', blog: '/blog' },
};
export function isLocale(value: string): value is Locale { return (locales as readonly string[]).includes(value); }
export function pagePath(locale: Locale, key: PageKey): string { return `${locale === 'es' ? '' : `/${locale}`}${routes[locale][key]}` || '/'; }

export function knownInternationalPath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  if (!isLocale(parts[0] ?? '') || parts[0] === 'es') return false;
  const locale = parts[0] as Locale;
  return pageKeys.some(key => pagePath(locale,key) === pathname) || articleRegistry.some(a => a.slugs[locale] && `${pagePath(locale, 'blog')}/${a.slugs[locale]}` === pathname);
}
