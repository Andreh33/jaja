'use client';
import { usePathname } from 'next/navigation';
import { pageKeys, pagePath, articleRegistry, type Locale } from '@/lib/international-routes';
const names: Record<Locale, string> = { es: 'Español', en: 'English', fr: 'Français', de: 'Deutsch', pt: 'Português', it: 'Italiano' };
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const key = pageKeys.find(key => pagePath('es', key) === pathname) ?? 'home';
  const article = articleRegistry.find(a => `/blog/${a.slugs.es}` === pathname);
  return <nav aria-label="Idiomas" className="language-switcher">{(Object.keys(names) as Locale[]).map(locale => <a key={locale} href={article ? `${pagePath(locale, 'blog')}/${article.slugs[locale]}` : pagePath(locale, key)} hrefLang={locale} lang={locale} aria-current={locale === 'es' ? 'page' : undefined}>{names[locale]}</a>)}</nav>;
}
