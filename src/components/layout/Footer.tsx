import Link from 'next/link';
import Logo from './Logo';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/stripe-links';

/** Ciudades destacadas: refuerzan el descubrimiento de las landing locales
 *  desde todas las páginas (Google apenas las encuentra desde el hub solo). */
const CIUDADES = [
  { slug: 'madrid', name: 'Madrid' },
  { slug: 'barcelona', name: 'Barcelona' },
  { slug: 'valencia', name: 'Valencia' },
  { slug: 'sevilla', name: 'Sevilla' },
  { slug: 'bilbao', name: 'Bilbao' },
  { slug: 'zaragoza', name: 'Zaragoza' },
  { slug: 'malaga', name: 'Málaga' },
  { slug: 'badajoz', name: 'Badajoz' },
  { slug: 'merida', name: 'Mérida' },
];

const cols = [
  {
    title: 'Servicios',
    links: [
      { href: '/tienda/web', label: 'Página web' },
      { href: '/tienda/online', label: 'Tienda online' },
      { href: '/tienda/agente-ia', label: 'Agente de IA' },
      { href: '/tienda/calculadora', label: 'Calculadora de presupuesto' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { href: '/sobre-nosotros', label: 'Sobre nosotros' },
      { href: '/proyectos', label: 'Proyectos reales' },
      { href: '/blog', label: 'Blog' },
      { href: '/cobertura', label: 'Cobertura nacional' },
      { href: '/contacto', label: 'Contacto' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terminos', label: 'Términos y condiciones' },
      { href: '/privacidad', label: 'Política de privacidad' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo size="lg" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Diseño web, tiendas online y agentes de IA con n8n para empresas de toda España.
              Entregamos en 24-48h. Sin permanencia.
            </p>
            <div className="mt-6 flex items-start gap-3 text-sm text-white/60">
              <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--purple-300)' }} />
              <span>Calle Puente 3<br />06490 Puebla de la Calzada · Badajoz</span>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">{c.title}</h4>
              <ul className="space-y-3">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline text-sm text-white/70 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-2">
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">Contacto</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a className="inline-flex items-center gap-2 hover:text-white" href={whatsappLink('Hola, quiero saber más sobre Latech')} target="_blank" rel="noreferrer">
                  <MessageCircle size={14} style={{ color: 'var(--success)' }} /> WhatsApp
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-2 hover:text-white" href="tel:+34684739091">
                  <Phone size={14} style={{ color: 'var(--purple-300)' }} /> +34 684 73 90 91
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-2 hover:text-white" href="mailto:info@latech.es">
                  <Mail size={14} style={{ color: 'var(--purple-300)' }} /> info@latech.es
                </a>
              </li>
              {/* Redes sociales: restaurar los iconos cuando existan los
                  perfiles reales (y añadirlos como sameAs en lib/seo.ts).
                  Un href="#" es un enlace muerto para usuarios y crawlers. */}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6" style={{ borderColor: 'var(--border-subtle)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Diseño web en tu ciudad
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/45">
            {CIUDADES.map((c, i) => (
              <span key={c.slug}>
                {i > 0 && ' · '}
                <Link href={`/diseno-web/${c.slug}`} className="transition-colors hover:text-white">
                  Diseño web en {c.name}
                </Link>
              </span>
            ))}
            {' · '}
            <Link href="/cobertura" className="underline transition-colors hover:text-white">
              ver las 45 zonas
            </Link>
          </p>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t pt-6 text-xs text-white/40 md:flex-row md:items-center" style={{ borderColor: 'var(--border-subtle)' }}>
          <p>© {new Date().getFullYear()} Latech · Hecho en Badajoz con cariño.</p>
          <p className="font-mono">v1.0 · Next.js · Vercel · Turso</p>
        </div>
      </div>
      {/* Hueco para que la MobileCtaBar fija no tape el final del footer en móvil. */}
      <div aria-hidden className="h-16 md:hidden" />
    </footer>
  );
}
