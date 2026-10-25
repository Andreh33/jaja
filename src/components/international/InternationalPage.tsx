import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { projects } from '@/lib/projects';
import { whatsappLink } from '@/lib/stripe-links';
import { ORG_REF, ORG_ID } from '@/lib/seo';
import { dictionaries, equivalents, locales, pagePath, articlePath, INTERNATIONAL_DATE, SITE, type Locale, type PageKey, type ResolvedPage, type Dictionary, type InternationalArticle } from '@/lib/international';

const text = (d: Dictionary, key: string) => String(d.ui[key] ?? key);
function Languages({ locale, page }: { locale: Locale; page: ResolvedPage }) {
  const urls = equivalents(page.key, page.article?.id);
  return <nav className="intl-languages" aria-label={text(dictionaries[locale], 'language')}>{locales.map(l => <a key={l} href={new URL(urls[l]).pathname} hrefLang={l} lang={l} aria-current={l === locale ? 'page' : undefined}>{dictionaries[l].name}</a>)}</nav>;
}
function Action({ locale, subject, secondary = false }: { locale: Locale; subject?: string; secondary?: boolean }) {
  const d = dictionaries[locale];
  const message = `${text(d, 'whatsappMessage')}${subject ? `\n\n${subject}` : ''}`;
  return <a className={secondary ? 'intl-action intl-action-secondary' : 'intl-action'} href={whatsappLink(message)} target="_blank" rel="noreferrer"><MessageCircle size={18} aria-hidden="true" />{text(d, 'whatsapp')}<ArrowUpRight size={17} aria-hidden="true" /></a>;
}
function ArticleList({ locale, articles }: { locale: Locale; articles: InternationalArticle[] }) {
  const d = dictionaries[locale];
  return <div className="intl-articles">{articles.map(a => <article key={a.id}><h3><Link href={articlePath(locale, a.id)}>{a.title}</Link></h3><p>{a.description}</p><Link className="intl-text-link" href={articlePath(locale, a.id)}>{text(d, 'readMore')} <ArrowUpRight size={16} aria-hidden="true" /></Link></article>)}</div>;
}
const serviceLabels: Record<Locale, string> = { es: 'Ver servicio', en: 'Explore the service', fr: 'Découvrir le service', de: 'Leistung ansehen', pt: 'Conhecer o serviço', it: 'Scopri il servizio' };
function Services({ locale }: { locale: Locale }) {
  const d = dictionaries[locale];
  return <div className="intl-services">{d.services.map(s => <article key={s.id}><h3><Link href={pagePath(locale, s.id as PageKey)}>{s.title}</Link></h3><p>{s.intro}</p><Link className="intl-text-link" href={pagePath(locale, s.id as PageKey)}>{serviceLabels[locale]} <ArrowUpRight size={16} aria-hidden="true" /></Link></article>)}</div>;
}
function Projects({ locale, full = false }: { locale: Locale; full?: boolean }) {
  return <div className="intl-projects">{(full ? projects : projects.slice(0, 4)).map(p => <a href={p.url} target="_blank" rel="noreferrer" key={p.id} aria-label={`${p.name} · ${p.domain}`}><div className="intl-project-image"><Image src={p.image} alt={p.name} width={960} height={640} sizes="(max-width: 700px) 100vw, 50vw" /></div><h3>{p.name}<ArrowUpRight size={19} aria-hidden="true" /></h3><span>{p.domain}</span></a>)}<Link className="intl-text-link" href={pagePath(locale, 'projects')}>{text(dictionaries[locale], 'projects')} <ArrowUpRight size={16} aria-hidden="true" /></Link></div>;
}

export default function InternationalPage({ locale, page }: { locale: Locale; page: ResolvedPage }) {
  const d = dictionaries[locale];
  const t = (key: string) => text(d, key);
  const service = d.services.find(s => s.id === page.key);
  const title = page.article?.title ?? service?.title ?? (page.key === 'home' ? d.home.heading : String(d.ui[`${page.key}Title`] ?? d.ui[page.key]));
  const intro = service?.intro ?? (page.key === 'home' ? d.home.intro : String(d.ui[`${page.key}Intro`] ?? (page.key === 'services' ? d.ui.serviceIntro : page.key === 'blog' ? d.ui.articlesIntro : d.ui.remote)));
  const url = `${SITE}${page.article ? articlePath(locale, page.article.id) : pagePath(locale, page.key as PageKey)}`;
  const related = d.articles.filter(a => a.id !== page.article?.id).slice(0, 3);
  const relevantService: PageKey = page.article?.id === 'online-store' ? 'shop' : page.article?.id === 'ai-automation' ? 'ai' : 'web';
  const schema = page.article ? {
    '@context': 'https://schema.org', '@type': 'BlogPosting', '@id': `${url}#article`, headline: page.article.title, description: page.article.description, inLanguage: locale, url, datePublished: INTERNATIONAL_DATE, dateModified: INTERNATIONAL_DATE, author: ORG_REF, publisher: ORG_REF, image: `${SITE}/${locale}/opengraph-image`, mainEntityOfPage: url,
  } : { '@context': 'https://schema.org', '@type': service ? 'Service' : 'WebPage', '@id': `${url}#${service ? 'service' : 'page'}`, name: title, description: intro, inLanguage: locale, url, ...(service ? { provider: ORG_REF, serviceType: service.title, availableChannel: { '@type': 'ServiceChannel', serviceUrl: pagePath(locale, 'contact') } } : { about: { '@id': ORG_ID } }) };
  return <>
    <JsonLd data={schema} />
    <JsonLd data={{ '@context': 'https://schema.org', ...ORG_REF, address: { '@type': 'PostalAddress', addressLocality: 'Puebla de la Calzada', addressRegion: 'Badajoz', addressCountry: 'ES' }, telephone: '+34684739091', email: 'info@latech.es' }} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: t('home'), item: `${SITE}${pagePath(locale, 'home')}` }, ...(page.key === 'home' ? [] : [{ '@type': 'ListItem', position: 2, name: page.article ? t('blog') : title, item: page.article ? `${SITE}${pagePath(locale, 'blog')}` : url }]), ...(page.article ? [{ '@type': 'ListItem', position: 3, name: title, item: url }] : [])] }} />
    <header className="intl-header intl-container"><Link href={pagePath(locale, 'home')} aria-label={`Latech · ${t('home')}`} className="intl-brand"><Image src="/brand/latech-logo.webp" alt="Latech" width={78} height={41} priority unoptimized style={{ width: 78, height: 'auto' }} /></Link><nav className="intl-nav" aria-label={t('home')}>{(['services', 'projects', 'about', 'blog', 'contact'] as const).map(k => <Link key={k} href={pagePath(locale, k)} aria-current={page.key === k ? 'page' : undefined}>{t(k)}</Link>)}</nav><Languages locale={locale} page={page} /></header>
    <main id="main-content" tabIndex={-1} className="intl-container">
      <section className={`intl-hero ${page.key === 'home' ? 'intl-home-hero' : ''}`}>
        {page.key !== 'home' && <Link className="intl-text-link" href={pagePath(locale, page.article ? 'blog' : 'home')}>{page.article ? t('backToBlog') : `Latech / ${t('home')}`}</Link>}
        <h1>{title}</h1>
        {!page.article && <p className="intl-lead">{intro}</p>}
        {page.article && <><p className="intl-lead">{page.article.description}</p><p className="intl-byline">{t('author')} · <time dateTime={INTERNATIONAL_DATE}>{new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'Europe/Madrid' }).format(new Date(INTERNATIONAL_DATE))}</time></p></>}
        {!page.article && <div className="intl-actions"><Action locale={locale} subject={service?.title} />{page.key === 'home' && <Link href={pagePath(locale, 'projects')} className="intl-text-link">{t('projects')} <ArrowUpRight size={17} aria-hidden="true" /></Link>}</div>}
      </section>

      {page.key === 'home' && <>
        <section className="intl-section"><div className="intl-two-column"><h2>{t('services')}</h2><div>{d.home.body.map(p => <p key={p}>{p}</p>)}</div></div><Services locale={locale} /></section>
        <section className="intl-section"><h2>{t('projects')}</h2><p className="intl-section-intro">{t('projectsIntro')}</p><Projects locale={locale} /></section>
        <section className="intl-section intl-two-column"><h2>{t('processTitle')}</h2><ol className="intl-process">{d.ui.processSteps.map(step => <li key={step}>{step}</li>)}</ol></section>
        <section className="intl-section"><h2>{t('blog')}</h2><p className="intl-section-intro">{t('articlesIntro')}</p><ArticleList locale={locale} articles={d.articles.slice(0, 3)} /><Link className="intl-text-link" href={pagePath(locale, 'blog')}>{t('allArticles')} <ArrowUpRight size={16} aria-hidden="true" /></Link></section>
      </>}
      {page.key === 'services' && <section className="intl-section"><p className="intl-section-intro">{t('serviceIntro')}</p><Services locale={locale} /></section>}
      {service && <><section className="intl-prose intl-section">{service.sections.map(s => <section key={s.title}><h2>{s.title}</h2>{s.paragraphs.map(p => <p key={p}>{p}</p>)}</section>)}<Action locale={locale} subject={service.title} /></section><section className="intl-section"><h2>{t('related')}</h2><ArticleList locale={locale} articles={d.articles.filter(a => service.id === 'shop' ? a.id === 'online-store' || a.id === 'whatsapp-conversion' : service.id === 'ai' ? a.id === 'ai-automation' || a.id === 'whatsapp-conversion' : !['online-store', 'ai-automation'].includes(a.id)).slice(0, 3)} /></section></>}
      {page.key === 'about' && <section className="intl-section intl-prose">{d.ui.aboutBody.map(p => <p key={p}>{p}</p>)}<Link className="intl-text-link" href={pagePath(locale, 'projects')}>{t('projects')} <ArrowUpRight size={16} aria-hidden="true" /></Link></section>}
      {page.key === 'projects' && <section className="intl-section"><Projects locale={locale} full /></section>}
      {page.key === 'contact' && <section className="intl-section intl-two-column"><div><h2>{t('contactDetails')}</h2><p>{t('remote')}</p><p>Calle Puente 3<br />06490 Puebla de la Calzada · Badajoz · {new Intl.DisplayNames([locale], { type: 'region' }).of('ES')}</p></div><address className="intl-contact"><a href="tel:+34684739091">+34 684 73 90 91</a><a href="mailto:info@latech.es">info@latech.es</a><Action locale={locale} /></address></section>}
      {page.key === 'blog' && <section className="intl-section"><p className="intl-section-intro">{t('articlesIntro')}</p><ArticleList locale={locale} articles={d.articles} /></section>}
      {page.article && <><article className="intl-prose intl-article">{page.article.intro.map(p => <p key={p}>{p}</p>)}{page.article.sections.map(s => <section key={s.title}><h2>{s.title}</h2>{s.paragraphs.map(p => <p key={p}>{p}</p>)}</section>)}<ul>{page.article.checklist.map(item => <li key={item}>{item}</li>)}</ul><p>{page.article.conclusion}</p><div className="intl-article-action"><Link className="intl-text-link" href={pagePath(locale, relevantService)}>{d.services.find(s => s.id === relevantService)!.title} <ArrowUpRight size={16} aria-hidden="true" /></Link><Action locale={locale} subject={`${page.article.title}\n${url}`} /></div><p className="intl-sources"><a href={`https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=${locale}`} target="_blank" rel="noreferrer">Google Search Central</a> · <a href={`https://web.dev/learn/performance?hl=${locale}`} target="_blank" rel="noreferrer">web.dev</a></p></article><section className="intl-section"><h2>{t('related')}</h2><ArticleList locale={locale} articles={related} /></section></>}
      {page.key !== 'contact' && <section className="intl-section intl-contact-banner"><h2>{t('contactTitle')}</h2><p>{t('contactIntro')}</p><Action locale={locale} subject={page.article?.title ?? service?.title} /></section>}
    </main>
    <footer className="intl-footer intl-container"><div><Link href={pagePath(locale, 'home')} className="intl-footer-brand">Latech</Link><p>{t('remote')}</p><a href="mailto:info@latech.es">info@latech.es</a></div><nav aria-label={t('services')}>{(['web', 'shop', 'ai'] as const).map(key => <Link key={key} href={pagePath(locale, key)}>{d.services.find(s => s.id === key)!.title}</Link>)}</nav><div><Languages locale={locale} page={page} /><p className="intl-legal"><Link href="/privacidad" hrefLang="es">{t('privacy')} (ES)</Link><Link href="/terminos" hrefLang="es">{t('terms')} (ES)</Link></p><small>© 2026 Latech</small></div></footer>
    <div className="intl-sticky-contact"><Action locale={locale} subject={page.article?.title ?? service?.title} /></div>
  </>;
}
