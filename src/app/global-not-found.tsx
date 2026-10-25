import type { Metadata } from 'next';
import Link from 'next/link';
import { locales, localeNames, pagePath, htmlLanguage, seoLanguage } from '@/lib/international-routes';
import './globals.css';
export const metadata: Metadata = { title: '404 · Latech', robots: { index: false, follow: true } };
export default function GlobalNotFound() {
  return <html lang="es-ES"><body><main id="main-content" style={{ maxWidth: 720, margin: '15vh auto', padding: 24 }}><h1>404 · Página no encontrada</h1><p>La dirección no existe. / This page does not exist.</p><Link href="/">Latech · Inicio / Home</Link><nav aria-label="Idiomas" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 32 }}>{locales.map(locale => <a key={locale} href={pagePath(locale, 'home')} hrefLang={seoLanguage(locale)} lang={htmlLanguage(locale)}>{localeNames[locale]}</a>)}</nav></main></body></html>;
}
