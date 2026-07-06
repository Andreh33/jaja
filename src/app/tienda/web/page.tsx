import type { Metadata } from 'next';
import { Globe, Zap, Shield, Smartphone, Search, Code2, ArrowRight } from 'lucide-react';
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
import NumberFlow from '@/components/effects/NumberFlow';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { serviceJsonLd, faqJsonLd, breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Diseño web profesional para empresas en 48h',
  description: 'Página web profesional con SEO técnico, optimización móvil y entrega en 24-48h. 60€/mes + 600€ creación. Sin permanencia. Para toda España.',
  alternates: { canonical: '/tienda/web' },
  openGraph: {
    title: 'Diseño web profesional para empresas en 48h · Latech',
    description: 'Web profesional con SEO técnico y entrega en 24-48h. 60€/mes + 600€ creación. Sin permanencia.',
    url: '/tienda/web',
    siteName: 'Latech',
    locale: 'es_ES',
    type: 'website',
  },
};

const GUIDES = [
  { href: '/blog/web-actual-perdiendo-clientes', label: 'Por qué tu web actual está perdiendo clientes' },
  { href: '/blog/elegir-empresa-diseno-web', label: 'Cómo elegir empresa de diseño web (sin equivocarte)' },
  { href: '/blog/seo-local-badajoz', label: 'SEO local: cómo aparecer cuando te buscan en tu zona' },
];

const FEATURES = [
  { icon: Code2, title: 'Stack moderno', desc: 'Next.js, React, Tailwind, Vercel. La misma tecnología que usan OpenAI y Notion.' },
  { icon: Smartphone, title: 'Mobile-first', desc: 'Diseñada primero para móvil, donde está el 70% de tus visitantes.' },
  { icon: Search, title: 'SEO técnico', desc: 'Auditoría completa, Core Web Vitals, schema markup y sitemap optimizado.' },
  { icon: Zap, title: 'Velocidad extrema', desc: 'Carga en menos de 1 segundo. Lighthouse score 95+ en todas las métricas.' },
  { icon: Shield, title: 'Seguridad sólida', desc: 'SSL automático, headers de seguridad, protección DDoS y backups diarios.' },
  { icon: Globe, title: 'Análisis local', desc: 'Investigación de palabras clave de tu zona y competencia para dominar tu mercado.' },
];

const FAQS = [
  { q: '¿En cuánto tiempo está lista?', a: '24-48h desde que recibimos textos, fotos y logo. Si tienes prisa, podemos priorizar.' },
  { q: '¿Puedo añadir secciones después?', a: 'Sí. Cambios menores incluidos cada mes. Secciones grandes son proyectos adicionales con presupuesto previo.' },
  { q: '¿Y si quiero cambiar de hosting?', a: 'Puedes. Te transferimos el código y el dominio sin problemas. Sin permanencia, sin candados.' },
  { q: '¿Está optimizada para Google?', a: 'Sí. Cada web sale con auditoría SEO técnica, palabras clave locales y schema markup correctamente implementado.' },
];

export default function WebPlanPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: 'Diseño web profesional',
          description:
            'Página web profesional a medida con SEO técnico, optimización móvil y entrega en 24-48h. Para empresas de toda España.',
          path: '/tienda/web',
          price: '600',
        })}
      />
      <JsonLd data={faqJsonLd(FAQS)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Tienda', path: '/tienda' },
          { name: 'Plan Web', path: '/tienda/web' },
        ])}
      />
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground />
      <MouseGlow />
      <main className="relative z-10">
        <section className="pt-44 pb-20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <div className="text-left">
              <Breadcrumbs
                items={[
                  { name: 'Inicio', path: '/' },
                  { name: 'Tienda', path: '/tienda' },
                  { name: 'Plan Web', path: '/tienda/web' },
                ]}
              />
            </div>
            <Reveal>
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent-web)', border: '1px solid rgba(59,130,246,0.3)' }}
              >
                ● PLAN WEB
              </span>
              <h1 className="mt-7 font-display text-balance text-5xl md:text-7xl" style={{ letterSpacing: '-0.04em', fontWeight: 800, lineHeight: 1 }}>
                Una web profesional,<br />
                <GradientText as="span">optimizada y entregada</GradientText><br />
                en 48 horas.
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/65">
                Diseño adaptado a tu marca, SEO técnico, mobile-first y todas las medidas de seguridad activadas
                desde el día uno.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <PlanCard
                plan={{
                  badge: 'Plan Web',
                  price: 60,
                  oneTime: '+ 600€ pago único de creación',
                  accent: 'blue',
                  features: [
                    'Desarrollo completo de la página web',
                    'Diseño profesional adaptado a la imagen de la empresa',
                    'Optimización SEO técnica del sitio web',
                    'Adaptación a dispositivos móviles',
                    'Optimización de la web (velocidad y Core Web Vitals)',
                    'Implementación de medidas de seguridad (SSL, headers, protección)',
                    'Análisis de competencia y palabras clave locales',
                    'Hosting de máximo nivel en Vercel incluido',
                    'Cambios menores incluidos cada mes',
                    'Soporte por WhatsApp y email',
                  ],
                  cta: { label: 'Contratar plan web', href: STRIPE_LINKS.web, target: '_blank', rel: 'noreferrer' },
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
                  No es una web cualquiera.<br />
                  <span style={{ color: 'var(--accent-web)' }}>Es la base técnica adecuada.</span>
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
                        style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--accent-web)', border: '1px solid rgba(59,130,246,0.3)' }}
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
              <div className="grid items-center gap-10 md:grid-cols-2">
                <div>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Resultados</p>
                  <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                    Datos típicos<br />
                    <span style={{ color: 'var(--accent-web)' }}>tras 60 días.</span>
                  </h2>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60">
                    Los números reales de webs entregadas en el último año, después de dos meses de actividad.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { v: 200, sf: '%', l: 'Aumento velocidad' },
                    { v: 5, sf: '★', l: 'Posición media local' },
                    { v: 95, sf: '+', l: 'Lighthouse score' },
                    { v: 60, sf: '%', l: '+ leads generados' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl glass p-6">
                      <div className="font-display text-4xl tabular-nums leading-none text-white">
                        <NumberFlow value={s.v} suffix={s.sf} />
                      </div>
                      <div className="mt-2 text-xs uppercase tracking-wider text-white/50">{s.l}</div>
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
                  <details key={i} className="group rounded-2xl glass p-6 transition-colors open:bg-bg-glass-strong">
                    <summary className="flex cursor-pointer items-center justify-between text-base font-medium text-white">
                      {f.q}
                      <span className="ml-4 inline-flex h-7 w-7 items-center justify-center rounded-full text-white/60 group-open:rotate-45 transition-transform"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>+</span>
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
                        <ArrowRight size={13} style={{ color: 'var(--accent-web)' }} /> {g.label}
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
              <h3 className="font-display text-2xl text-white">Diseño web en toda España</h3>
              <p className="mt-3 text-sm text-white/60">Trabajamos en remoto para empresas de toda España. Algunas zonas:</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {['madrid', 'barcelona', 'valencia', 'sevilla', 'malaga', 'bilbao', 'zaragoza', 'badajoz'].map((c) => (
                  <Link key={c} href={`/diseno-web/${c}`} className="rounded-full glass px-4 py-2 text-xs text-white/70 transition-colors hover:text-white">
                    {c === 'a-coruna' ? 'A Coruña' : c.charAt(0).toUpperCase() + c.slice(1)}
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
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{ background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, transparent 70%)' }}
          />
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <h2 className="font-display text-4xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                Empieza tu web hoy.<br />
                <span style={{ color: 'var(--accent-web)' }}>Estará lista pasado mañana.</span>
              </h2>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <MagneticButton href={STRIPE_LINKS.web} target="_blank" rel="noreferrer" accent="blue">
                  Contratar plan web <ArrowRight size={16} />
                </MagneticButton>
                <MagneticButton href={whatsappLink('Hola, me interesa el plan web de Latech')} target="_blank" rel="noreferrer" variant="secondary">
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
