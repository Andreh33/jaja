import type { Metadata } from 'next';
import { ShoppingBag, CreditCard, BarChart3, Package, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal, RevealGroup, RevealItem } from '@/components/effects/Reveal';
import PlanCard from '@/components/shop/PlanCard';
import GradientText from '@/components/effects/GradientText';
import MagneticButton from '@/components/effects/MagneticButton';
import { STRIPE_LINKS, whatsappLink } from '@/lib/stripe-links';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { serviceJsonLd, faqJsonLd, breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Plan Tienda Online · E-commerce profesional en 48h',
  description: 'Tienda online con Stripe, Bizum, transferencia, SEO de productos y analítica integrada. 80€/mes + 600€ creación. Para toda España.',
  alternates: { canonical: '/tienda/online' },
};

const GUIDES = [
  { href: '/blog/tienda-online-vs-marketplace', label: 'Tienda online propia vs marketplace: qué te conviene' },
  { href: '/blog/stripe-empresas-guia-pagos-online', label: 'Stripe para empresas: guía completa de pagos online' },
  { href: '/blog/web-actual-perdiendo-clientes', label: 'Por qué tu web actual está perdiendo clientes' },
];

const FEATURES = [
  { icon: CreditCard, title: 'Stripe + Bizum + transfer', desc: 'Pasarelas seguras integradas. Tus clientes pagan como prefieran, en segundos.' },
  { icon: Package, title: 'Catálogo profesional', desc: 'Gestión de productos, variantes, stock y categorías. Subida en bulk si tienes muchos.' },
  { icon: BarChart3, title: 'Analítica integrada', desc: 'GA4 + Meta Pixel listos. Embudo de conversión, abandono de carrito, ROAS de anuncios.' },
  { icon: ShieldCheck, title: 'Seguridad PCI', desc: 'Las tarjetas nunca tocan tu servidor. Stripe Level 1, RGPD por defecto.' },
  { icon: TrendingUp, title: 'SEO de productos', desc: 'URLs limpias, schema Product, sitemaps de productos y categorías. Vendes desde Google.' },
  { icon: ShoppingBag, title: 'UX optimizada', desc: 'Carrito persistente, checkout en 3 pasos, gestión de cupones y emails automáticos.' },
];

const FAQS = [
  { q: '¿Funciona con Stripe en España?', a: 'Sí. Stripe es la pasarela mundial líder. Permite cobrar en EUR, con Bizum, Apple Pay, Google Pay, transferencia y tarjetas. Sin cuotas mensuales.' },
  { q: '¿Cuánto cobra Stripe por venta?', a: 'En España, 1.4% + 0.25€ por transacción europea. Bizum un 1.5%. Sin coste si no vendes. Las comisiones más competitivas del mercado.' },
  { q: '¿Y si quiero vender también en Amazon?', a: 'No te impide vender en marketplaces. Tu tienda propia y Amazon coexisten perfectamente. Estrategia híbrida recomendada para muchos sectores.' },
  { q: '¿Soporta suscripciones?', a: 'Sí. Stripe Billing está integrado: cobros recurrentes mensuales o anuales, reintentos automáticos, gestión de cancelaciones y facturas con IVA.' },
];

export default function OnlinePlanPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: 'Tienda online profesional',
          description:
            'Tienda online a medida con Stripe, Bizum y transferencia, SEO de productos y analítica integrada. Para empresas de toda España.',
          path: '/tienda/online',
          price: '600',
        })}
      />
      <JsonLd data={faqJsonLd(FAQS)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Tienda', path: '/tienda' },
          { name: 'Plan Tienda Online', path: '/tienda/online' },
        ])}
      />
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground />
      <MouseGlow />
      <main className="relative z-10">
        <section className="pt-44 pb-20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <Reveal>
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--accent-shop)', border: '1px solid rgba(249,115,22,0.3)' }}
              >
                ● PLAN TIENDA
              </span>
              <h1 className="mt-7 font-display text-balance text-5xl md:text-7xl" style={{ letterSpacing: '-0.04em', fontWeight: 800, lineHeight: 1 }}>
                Tu tienda online<br />
                <GradientText as="span">lista para vender</GradientText><br />
                en 48 horas.
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/65">
                Catálogo, pasarelas seguras, SEO de productos y analítica integrada.
                Empieza a cobrar pasado mañana.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <PlanCard
                plan={{
                  badge: 'Plan Tienda',
                  price: 80,
                  oneTime: '+ 600€ pago único de creación',
                  accent: 'orange',
                  features: [
                    'Desarrollo completo de la tienda online',
                    'Diseño e-commerce adaptado a la marca',
                    'Optimización SEO técnica para productos y categorías',
                    'Pasarelas de pago seguras (Stripe, Bizum, transferencia)',
                    'Gestión y organización del catálogo',
                    'Medidas de seguridad para transacciones (PCI compliant)',
                    'Analítica y seguimiento de ventas (GA4, Meta Pixel)',
                    'Análisis de competencia y SEO nacional',
                    'Hosting Vercel + CDN global',
                    'Cambios menores incluidos cada mes',
                  ],
                  cta: { label: 'Contratar plan tienda', href: STRIPE_LINKS.tienda, target: '_blank', rel: 'noreferrer' },
                  microtext: 'Pago seguro mediante Stripe. Te contactaremos en menos de 24h tras la suscripción.',
                }}
              />
            </Reveal>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <div className="mb-14 max-w-2xl">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Lo que recibes</p>
                <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                  Tu catálogo,<br />
                  <span style={{ color: 'var(--accent-shop)' }}>profesionalizado.</span>
                </h2>
              </div>
            </Reveal>
            <RevealGroup className="grid gap-5 md:grid-cols-3">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <RevealItem key={f.title}>
                    <div className="h-full rounded-2xl glass p-7 transition-transform hover:-translate-y-1">
                      <div
                        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--accent-shop)', border: '1px solid rgba(249,115,22,0.3)' }}
                      >
                        <Icon size={20} strokeWidth={1.6} />
                      </div>
                      <h3 className="font-display text-xl text-white">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">{f.desc}</p>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <div className="rounded-3xl glass p-8 md:p-14">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Pagos</p>
                <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                  Pasarelas integradas
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
                  Stripe es el estándar mundial. Y en España, Bizum suma confianza. Las dos integradas en el mismo checkout.
                </p>
                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  {['Stripe', 'Visa', 'Mastercard', 'Bizum', 'Apple Pay', 'Google Pay'].map((p) => (
                    <div
                      key={p}
                      className="flex h-20 items-center justify-center rounded-xl text-sm font-mono text-white/70 transition-colors hover:text-white"
                      style={{ background: 'rgba(7,5,14,0.6)', border: '1px solid var(--border-subtle)' }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <h2 className="mb-12 font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                Preguntas habituales
              </h2>
              <div className="space-y-3">
                {FAQS.map((f, i) => (
                  <details key={i} className="group rounded-2xl glass p-6">
                    <summary className="flex cursor-pointer items-center justify-between text-base font-medium text-white">
                      {f.q}
                      <span className="ml-4 inline-flex h-7 w-7 items-center justify-center rounded-full text-white/60 group-open:rotate-45 transition-transform" style={{ background: 'rgba(255,255,255,0.05)' }}>+</span>
                    </summary>
                    <p className="mt-4 text-sm leading-relaxed text-white/65">{f.a}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <div className="rounded-3xl glass p-7 md:p-10">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Guías relacionadas</p>
                <h3 className="font-display text-2xl text-white">Aprende antes de decidir</h3>
                <ul className="mt-5 space-y-3">
                  {GUIDES.map((g) => (
                    <li key={g.href}>
                      <Link
                        href={g.href}
                        className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
                      >
                        <ArrowRight size={13} style={{ color: 'var(--accent-shop)' }} /> {g.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">¿Dónde trabajamos?</p>
              <h3 className="font-display text-2xl text-white">Tiendas online en toda España</h3>
              <p className="mt-3 text-sm text-white/60">Montamos tu e-commerce en remoto para vender en toda España. Algunas zonas:</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['madrid', 'barcelona', 'valencia', 'sevilla', 'malaga', 'murcia', 'vigo', 'badajoz'].map((c) => (
                  <Link key={c} href={`/tienda-online/${c}`} className="rounded-full glass px-4 py-2 text-xs text-white/70 transition-colors hover:text-white">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Link>
                ))}
                <Link href="/cobertura" className="rounded-full px-4 py-2 text-xs text-white/80 underline transition-colors hover:text-white">
                  Ver todas
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative py-32">
          <div aria-hidden className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.18) 0%, transparent 70%)' }} />
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <h2 className="font-display text-4xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                Tu primera venta,<br />
                <span style={{ color: 'var(--accent-shop)' }}>esta semana.</span>
              </h2>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <MagneticButton href={STRIPE_LINKS.tienda} target="_blank" rel="noreferrer" accent="orange">
                  Contratar plan tienda <ArrowRight size={16} />
                </MagneticButton>
                <MagneticButton href={whatsappLink('Hola, me interesa el plan tienda online de Latech')} target="_blank" rel="noreferrer" variant="secondary">
                  Hablar primero
                </MagneticButton>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
