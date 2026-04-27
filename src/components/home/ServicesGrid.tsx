'use client';

import Link from 'next/link';
import { Globe, ShoppingBag, Bot, ArrowRight } from 'lucide-react';
import TiltCard from '../effects/TiltCard';
import Holographic from '../effects/Holographic';
import { Reveal, RevealGroup, RevealItem } from '../effects/Reveal';

const SERVICES = [
  {
    href: '/tienda/web',
    icon: Globe,
    title: 'Página Web',
    tagline: 'Tu primera impresión digital',
    desc: 'Diseño premium, SEO técnico y entrega en 48h. Adaptada a tu marca.',
    price: 'Desde 60€/mes',
    accent: 'var(--accent-web)',
    glow: 'var(--accent-web-glow)',
    bullets: ['Diseño profesional adaptado', 'SEO técnico + análisis local', 'Mobile-first y veloz'],
  },
  {
    href: '/tienda/online',
    icon: ShoppingBag,
    title: 'Tienda Online',
    tagline: 'Vende mientras duermes',
    desc: 'Catálogo, pasarelas seguras (Stripe + Bizum) y analítica integrada.',
    price: 'Desde 80€/mes',
    accent: 'var(--accent-shop)',
    glow: 'var(--accent-shop-glow)',
    bullets: ['Stripe + Bizum + transferencia', 'SEO de productos y categorías', 'GA4 y Meta Pixel listos'],
  },
  {
    href: '/tienda/agente-ia',
    icon: Bot,
    title: 'Agente de IA',
    tagline: 'Tu recepcionista que nunca duerme',
    desc: 'Atiende llamadas 24/7 con voz natural, conectado por n8n a tus sistemas.',
    price: 'Desde 150€/mes',
    accent: 'var(--accent-ia)',
    glow: 'var(--accent-ia-glow)',
    bullets: ['20 llamadas simultáneas', 'Memoria de clientes RGPD', 'Pagos por voz con Stripe'],
  },
];

export default function ServicesGrid() {
  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Servicios</p>
            <h2 className="font-display text-balance text-4xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
              Tres servicios.<br />
              <span style={{ color: 'var(--text-secondary)' }}>Cero compromisos.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/60">
              Cada uno entregado en 24-48h, sin permanencia y con stack técnico de máximo nivel.
            </p>
          </div>
        </Reveal>

        <RevealGroup className="grid gap-6 md:grid-cols-3" stagger={0.12}>
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <RevealItem key={s.href} className="h-full">
                <Link href={s.href} className="group block h-full">
                  <TiltCard className="h-full">
                    <Holographic className="relative flex h-full flex-col p-7 transition-all duration-300 group-hover:translate-y-[-4px]">
                      <div
                        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{ boxShadow: `0 0 80px ${s.glow}` }}
                      />
                      <div
                        className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ background: `${s.accent}1A`, border: `1px solid ${s.accent}40`, color: s.accent }}
                      >
                        <Icon size={22} strokeWidth={1.6} />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-white">{s.title}</h3>
                      <p className="mt-1 text-sm" style={{ color: s.accent }}>{s.tagline}</p>
                      <p className="mt-4 text-sm leading-relaxed text-white/65">{s.desc}</p>
                      <ul className="mt-5 space-y-2 text-sm text-white/70">
                        {s.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-2">
                            <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.accent }} />
                            {b}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-7 flex items-end justify-between border-t pt-5" style={{ borderColor: 'var(--border-subtle)' }}>
                        <span className="font-mono text-sm text-white/50">{s.price}</span>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                          style={{ color: s.accent, background: `${s.accent}15`, border: `1px solid ${s.accent}30` }}
                        >
                          Ver detalles <ArrowRight size={12} />
                        </span>
                      </div>
                    </Holographic>
                  </TiltCard>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
