'use client';
import { usePathname } from 'next/navigation';
import { pageKeys, pagePath, articleRegistry, locales, localeNames, isLocale, seoLanguage, htmlLanguage } from '@/lib/international-routes';
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const prefix = pathname.split('/')[1];
  const current = isLocale(prefix) ? prefix : 'es';
  const key = pageKeys.find(key => pagePath(current, key) === pathname) ?? 'home';
  const article = articleRegistry.find(a => a.slugs[current] && `${pagePath(current, 'blog')}/${a.slugs[current]}` === pathname);
  const available = article ? locales.filter(locale => article.slugs[locale]) : locales;
  return <nav aria-label="Idiomas" className="language-switcher">{available.map(locale => <a key={locale} href={article ? `${pagePath(locale, 'blog')}/${article.slugs[locale]}` : pagePath(locale, key)} hrefLang={seoLanguage(locale)} lang={htmlLanguage(locale)} aria-current={locale === current ? 'page' : undefined}>{localeNames[locale]}</a>)}</nav>;
}
