import Link from 'next/link';
import Logo from './Logo';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const InstagramIcon = (p: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);
const LinkedinIcon = (p: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 016 6v6h-4v-6a2 2 0 00-4 0v6h-4v-10h4v1.5A6 6 0 0116 8z" />
    <rect x="2" y="9" width="4" height="11" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { whatsappLink } from '@/lib/stripe-links';

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
      { href: '/blog', label: 'Blog' },
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
              <li className="flex items-center gap-3 pt-2">
                <a aria-label="Instagram" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full glass">
                  <InstagramIcon size={14} />
                </a>
                <a aria-label="LinkedIn" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full glass">
                  <LinkedinIcon size={14} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t pt-6 text-xs text-white/40 md:flex-row md:items-center" style={{ borderColor: 'var(--border-subtle)' }}>
          <p>© {new Date().getFullYear()} Latech · Hecho en Badajoz con cariño.</p>
          <p className="font-mono">v1.0 · Next.js · Vercel · Turso</p>
        </div>
      </div>
    </footer>
  );
}
