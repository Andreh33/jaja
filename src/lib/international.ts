import { locales, pageKeys, pagePath, isLocale, routes, type Locale, type PageKey } from './international-routes';
export { locales, pageKeys, pagePath, isLocale, type Locale, type PageKey } from './international-routes';
import type { Metadata, MetadataRoute } from 'next';
import es from '@/content/international/es.json';
import en from '@/content/international/en.json';
import fr from '@/content/international/fr.json';
import de from '@/content/international/de.json';
import pt from '@/content/international/pt.json';
import it from '@/content/international/it.json';

export const SITE = 'https://serviciosonlineweb.com';
export const INTERNATIONAL_DATE = '2026-10-25T12:00:00Z';
export type Section = { title: string; paragraphs: string[] };
export type InternationalArticle = { id: string; title: string; slug: string; description: string; intro: string[]; sections: Section[]; checklist: string[]; conclusion: string };
export type Dictionary = {
  code: string; name: string; ogLocale: string;
  ui: Record<string, string | string[]> & { processSteps: string[]; aboutBody: string[] };
  home: { title: string; description: string; heading: string; intro: string; body: string[] };
  services: { id: string; title: string; description: string; intro: string; sections: Section[] }[];
  articles: InternationalArticle[];
};
export const dictionaries: Record<Locale, Dictionary> = { es, en, fr, de, pt, it };
export function articlePath(locale: Locale, id: string): string {
  const article = dictionaries[locale].articles.find(a => a.id === id);
  if (!article) throw new Error(`Unknown article: ${id}`);
  return `${pagePath(locale, 'blog')}/${article.slug}`;
}
export type ResolvedPage = { key: PageKey | 'article'; article?: InternationalArticle };
export function resolvePage(locale: string, parts: string[] = []): ResolvedPage | null {
  if (!isLocale(locale)) return null;
  const suffix = parts.length ? `/${parts.join('/')}` : '';
  const key = pageKeys.find(key => routes[locale][key] === suffix);
  if (key) return { key };
  if (parts.length === 2 && parts[0] === 'blog') {
    const article = dictionaries[locale].articles.find(a => a.slug === parts[1]);
    if (article) return { key: 'article', article };
  }
  return null;
}
export function equivalents(key: PageKey | 'article', id?: string): Record<string, string> {
  if (key === 'article' && !dictionaries.es.articles.some(a => a.id === id)) return {};
  const languages = Object.fromEntries(locales.map(locale => [locale, `${SITE}${key === 'article' ? articlePath(locale, id!) : pagePath(locale, key)}`]));
  return { ...languages, 'x-default': languages.es };
}
export function languageLinks(pathname: string): { locale: Locale; name: string; href: string }[] {
  const parts = pathname.split('/').filter(Boolean);
  const locale = isLocale(parts[0] ?? '') ? parts[0] as Locale : 'es';
  const resolved = resolvePage(locale, locale === 'es' ? parts : parts.slice(1));
  const urls = resolved ? equivalents(resolved.key, resolved.article?.id) : equivalents('home');
  return locales.map(locale => ({ locale, name: dictionaries[locale].name, href: new URL(urls[locale]).pathname }));
}
export function internationalMetadata(locale: Locale, page: ResolvedPage): Metadata {
  const d = dictionaries[locale];
  const service = d.services.find(s => s.id === page.key);
  const title = page.article?.title ?? service?.title ?? (page.key === 'home' ? d.home.title : String(d.ui[`${page.key}Title`] ?? d.ui[page.key]));
  const description = page.article?.description ?? service?.description ?? (page.key === 'home' ? d.home.description : String(d.ui[`${page.key}Intro`] ?? (page.key === 'services' ? d.ui.serviceIntro : page.key === 'blog' ? d.ui.articlesIntro : d.ui.remote)));
  const path = page.article ? articlePath(locale, page.article.id) : pagePath(locale, page.key as PageKey);
  return {
    title: { absolute: `${title}${/latech/i.test(title) ? '' : ' · Latech'}` }, description,
    keywords: null,
    alternates: { canonical: `${SITE}${path}`, languages: equivalents(page.key, page.article?.id) },
    openGraph: { title, description, url: `${SITE}${path}`, siteName: 'Latech', locale: d.ogLocale, alternateLocale: locales.filter(l => l !== locale).map(l => dictionaries[l].ogLocale), type: page.article ? 'article' : 'website', images: [{ url: `${SITE}/${locale}/opengraph-image`, width: 1200, height: 630, alt: 'Latech' }], ...(page.article ? { publishedTime: INTERNATIONAL_DATE, modifiedTime: INTERNATIONAL_DATE, authors: ['Latech'] } : {}) },
    twitter: { card: 'summary_large_image', title, description, images: [`${SITE}/${locale}/opengraph-image`] },
  };
}
export function internationalSitemap(): MetadataRoute.Sitemap {
  return locales.filter(l => l !== 'es').flatMap(locale => [
    ...pageKeys.map(key => ({ url: `${SITE}${pagePath(locale, key)}`, lastModified: INTERNATIONAL_DATE, alternates: { languages: equivalents(key) } })),
    ...dictionaries[locale].articles.map(a => ({ url: `${SITE}${articlePath(locale, a.id)}`, lastModified: INTERNATIONAL_DATE, alternates: { languages: equivalents('article', a.id) } })),
  ]);
}
export const spanishArticles = dictionaries.es.articles.map(a => {
  const service: PageKey = a.id === 'online-store' ? 'shop' : a.id === 'ai-automation' ? 'ai' : 'web';
  const content = [...a.intro, ...a.sections.flatMap(s => [`## ${s.title}`, ...s.paragraphs]), '## Lista de comprobación', a.checklist.map(item => `- ${item}`).join('\n'), a.conclusion,
    `Consulta nuestro servicio de [${dictionaries.es.services.find(s => s.id === service)!.title}](${pagePath('es', service)}) y [cuéntanos tu proyecto](/contacto).`,
    '## Guías relacionadas', dictionaries.es.articles.filter(other => other.id !== a.id).slice(0, 3).map(other => `- [${other.title}](${articlePath('es', other.id)})`).join('\n'),
    '## Fuentes para profundizar', '[Google Search Central: SEO](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=es) · [web.dev: rendimiento](https://web.dev/learn/performance?hl=es)',
  ].join('\n\n');
  return { id: `international-20261025-${a.id}`, slug: a.slug, title: a.title, excerpt: a.description, content, category: 'SEO', author: 'Equipo Latech', cover: null, published: true, publishedAt: new Date(INTERNATIONAL_DATE), readingMinutes: Math.ceil(content.split(/\s+/).length / 200) };
});
