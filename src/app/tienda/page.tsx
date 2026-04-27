import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe, ShoppingBag, Bot, ArrowRight, MessageCircle } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal } from '@/components/effects/Reveal';
import TiltCard from '@/components/effects/TiltCard';
import Holographic from '@/components/effects/Holographic';
import MagneticButton from '@/components/effects/MagneticButton';
import { whatsappLink } from '@/lib/stripe-links';

export const metadata: Metadata = {
  title: 'Tienda · Servicios',
  description: 'Tres soluciones técnicas: página web, tienda online y agente de IA. Sin permanencia. Entrega en 24-48h.',
};

const SHOPS = [
  {
    href: '/tienda/web',
    icon: Globe,
    title: 'PÁGINA WEB',
    tagline: 'Tu primera impresión digital',
    description: 'Diseño profesional, SEO técnico y velocidad excepcional. Tu carta de presentación online, lista en 48h.',
    points: ['Diseño adaptado a tu marca', 'SEO técnico + análisis local', 'Hosting seguro con SSL'],
    price: '60€/mes + 400€ creación',
    accent: 'var(--accent-web)',
    glow: 'var(--accent-web-glow)',
    accentName: 'blue' as const,
  },
  {
    href: '/tienda/online',
    icon: ShoppingBag,
    title: 'TIENDA ONLINE',
    tagline: 'Vende mientras duermes',
    description: 'Catálogo, pasarelas seguras y analítica. Stripe, Bizum y transferencia integrados. Tu e-commerce en 48h.',
    points: ['Stripe + Bizum + transferencia', 'GA4 y Meta Pixel listos', 'SEO de productos'],
    price: '80€/mes + 400€ creación',
    accent: 'var(--accent-shop)',
    glow: 'var(--accent-shop-glow)',
    accentName: 'orange' as const,
  },
  {
    href: '/tienda/agente-ia',
    icon: Bot,
    title: 'AGENTE IA',
    tagline: 'Tu recepcionista que nunca duerme',
    description: 'Atiende llamadas 24/7 con voz natural, conectado por n8n a WhatsApp, Stripe y tu CRM.',
    points: ['20 llamadas simultáneas', 'Memoria de clientes RGPD', 'Pagos por voz con Stripe'],
    price: 'Desde 150€/mes',
    accent: 'var(--accent-ia)',
    glow: 'var(--accent-ia-glow)',
    accentName: 'green' as const,
  },
];

export default function TiendaPage() {
  return (
    <>
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground />
      <MouseGlow />
      <main className="relative z-10">
        <section className="pt-44 pb-16">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <Reveal>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Tienda</p>
              <h1 className="font-display text-balance text-5xl md:text-7xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                Tres soluciones.<br />
                <span style={{ color: 'var(--purple-300)' }}>Sin compromisos.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-white/60">
                Sin permanencia. Entrega en 24-48h. Cambios menores incluidos cada mes.
              </p>
            </Reveal>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-12 px-6 pb-24">
          {SHOPS.map((s, i) => {
            const Icon = s.icon;
            const reverse = i % 2 === 1;
            return (
              <Reveal key={s.href}>
                <Link href={s.href} className="group block">
                  <TiltCard max={4}>
                    <Holographic className="relative overflow-hidden p-8 transition-all md:p-14" rounded="rounded-[2.5rem]">
                      <div
                        className="pointer-events-none absolute inset-0 rounded-[2.5rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{ boxShadow: `0 0 100px ${s.glow}` }}
                      />
                      <div className={`grid gap-10 md:grid-cols-2 md:items-center ${reverse ? 'md:[direction:rtl]' : ''}`}>
                        <div className={reverse ? '[direction:ltr]' : ''}>
                          <div
                            className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                            style={{ background: `${s.accent}1A`, border: `1px solid ${s.accent}40`, color: s.accent }}
                          >
                            <Icon size={26} strokeWidth={1.6} />
                          </div>
                          <h2 className="font-display text-4xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                            {s.title}
                          </h2>
                          <p className="mt-2 text-lg" style={{ color: s.accent }}>{s.tagline}</p>
                          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65">{s.description}</p>
                          <ul className="mt-6 space-y-2 text-sm text-white/75">
                            {s.points.map((p) => (
                              <li key={p} className="flex items-start gap-2">
                                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ background: s.accent }} />
                                {p}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-8 flex items-center gap-4">
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold transition-colors"
                              style={{ color: s.accent, background: `${s.accent}15`, border: `1px solid ${s.accent}30` }}
                            >
                              Ver plan completo <ArrowRight size={12} />
                            </span>
                            <span className="font-mono text-xs text-white/50">{s.price}</span>
                          </div>
                        </div>

                        <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${reverse ? '[direction:ltr]' : ''}`}>
                          <div
                            className="absolute inset-0 rounded-2xl"
                            style={{
                              background: `radial-gradient(circle at 30% 30%, ${s.accent}30, transparent 60%), radial-gradient(circle at 70% 70%, var(--purple-glow), transparent 60%)`,
                            }}
                          />
                          <div className="absolute inset-6 rounded-2xl border" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(7,5,14,0.6)' }}>
                            <div className="flex h-7 items-center gap-1.5 border-b px-3" style={{ borderColor: 'var(--border-subtle)' }}>
                              <div className="h-2 w-2 rounded-full bg-red-400/70" />
                              <div className="h-2 w-2 rounded-full bg-yellow-400/70" />
                              <div className="h-2 w-2 rounded-full bg-green-400/70" />
                            </div>
                            <div className="space-y-3 p-5">
                              <div className="h-2 w-1/2 rounded" style={{ background: s.accent, opacity: 0.6 }} />
                              <div className="h-2 w-3/4 rounded bg-white/10" />
                              <div className="h-2 w-2/3 rounded bg-white/10" />
                              <div className="mt-4 h-20 rounded-lg" style={{ background: `linear-gradient(135deg, ${s.accent}30, transparent)` }} />
                              <div className="grid grid-cols-3 gap-2">
                                <div className="h-12 rounded bg-white/5" />
                                <div className="h-12 rounded bg-white/5" />
                                <div className="h-12 rounded bg-white/5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Holographic>
                  </TiltCard>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <section className="py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                ¿No sabes cuál elegir?
              </h2>
              <p className="mt-3 text-white/60">Te asesoramos gratis en una llamada de 15 min.</p>
              <div className="mt-7 flex justify-center">
                <MagneticButton href={whatsappLink('Hola, me gustaría asesoramiento sobre los planes de Latech')} target="_blank" rel="noreferrer">
                  <MessageCircle size={16} /> Hablar por WhatsApp
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
