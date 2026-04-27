import type { Metadata } from 'next';
import {
  Bot, Phone, PhoneCall, Globe, Brain, FileText, CreditCard,
  Check, X, ArrowRight, Headphones, MessageCircle,
} from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal, RevealGroup, RevealItem } from '@/components/effects/Reveal';
import GradientText from '@/components/effects/GradientText';
import MagneticButton from '@/components/effects/MagneticButton';
import Holographic from '@/components/effects/Holographic';
import BeamBorder from '@/components/effects/BeamBorder';
import AudioPlayer from '@/components/shared/AudioPlayer';
import { whatsappLink, STRIPE_LINKS } from '@/lib/stripe-links';

export const metadata: Metadata = {
  title: 'Agente IA · Tu recepcionista 24/7 con n8n',
  description: 'Agente de IA que atiende llamadas 24/7, gestiona reservas, cobra con Stripe y recuerda a cada cliente. Desde 150€/mes.',
};

const FEATURES = [
  { icon: PhoneCall, title: 'Llamadas entrantes', desc: 'Atiende al instante cada llamada sin esperas. Hasta 20 simultáneas, sin perder ninguna.', badge: 'Hasta 20 simultáneas' },
  { icon: Phone, title: 'Llamadas salientes', desc: 'Confirma citas, hace seguimientos y contacta leads automáticamente según disparadores.', badge: 'Campañas automatizadas' },
  { icon: Globe, title: 'Widget en tu web', desc: 'Un botón en tu página que lanza llamada de voz con el agente directamente desde el navegador.', badge: 'Sin instalar nada' },
  { icon: Brain, title: 'Memoria de clientes', desc: '"Dame lo mismo de siempre" funciona de verdad. Recuerda nombre, dirección y pedidos.', badge: 'Base de datos segura' },
  { icon: FileText, title: 'Tickets y reportes', desc: 'Tras cada llamada genera informe o ticket y lo envía al negocio y al cliente.', badge: 'CRM integrado' },
  { icon: CreditCard, title: 'Pagos por voz', desc: 'Genera enlace de pago Stripe durante la llamada y lo envía por WhatsApp o email al momento.', badge: 'Stripe integrado' },
];

const SECTORES = [
  '🍕 Restaurantes', '💈 Peluquerías', '🏥 Clínicas', '🔧 Talleres',
  '🏨 Hoteles', '🛒 E-commerce', '🏡 Inmobiliarias', '⚖️ Despachos',
  '🎓 Academias', '🚗 Concesionarios',
];

const COMPARATIVA = [
  { human: 'Bajas, vacaciones, imprevistos', ia: 'Sin bajas ni vacaciones' },
  { human: 'Solo 1 llamada a la vez', ia: 'Hasta 20 llamadas simultáneas' },
  { human: 'No recuerda a todos los clientes', ia: 'Recuerda a cada cliente' },
  { human: 'Sin informes automáticos', ia: 'Informes automáticos siempre' },
  { human: 'No disponible 24h ni festivos', ia: 'Disponible 24h, 365 días' },
  { human: '1.200€-1.800€/mes', ia: 'Desde 150€/mes' },
];

const STEPS = [
  { n: '01', t: 'Configuramos tu agente', d: 'Entrenamos el bot con tu carta, horarios, precios, clientes habituales y el tono de tu marca.' },
  { n: '02', t: 'Conectamos tu número', d: 'Redirigimos las llamadas de tu número actual al agente. Sin cambiar nada de cara al cliente.' },
  { n: '03', t: 'Integramos tus canales', d: 'WhatsApp Business, email, Stripe, CRM y base de datos de clientes.' },
  { n: '04', t: 'A funcionar', d: 'Monitorización continua. El agente aprende y mejora cada semana.' },
];

const OBTIENES = [
  'Voz natural y tono personalizado a tu marca',
  'Panel de control con histórico de llamadas',
  'Transcripción y resumen de cada conversación',
  'Memoria de clientes en base de datos segura (RGPD)',
  'Widget para tu web sin coste adicional',
];

export default function AgenteIaPage() {
  const ctaWa = whatsappLink('Hola, me interesa el agente IA de Latech, me gustaría saber más');
  return (
    <>
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground intensity="strong" />
      <MouseGlow strong />
      <main className="relative z-10">
        <section className="pt-44 pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-14 md:grid-cols-2">
              <div>
                <Reveal>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                    style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--accent-ia)', border: '1px solid rgba(16,185,129,0.3)' }}
                  >
                    <span className="relative inline-flex h-2 w-2">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-dot" />
                    </span>
                    Solución IA · 2026
                  </span>
                  <h1 className="mt-7 font-display text-balance text-5xl md:text-7xl" style={{ letterSpacing: '-0.045em', fontWeight: 800, lineHeight: 0.98 }}>
                    Tu recepcionista<br />
                    con <GradientText as="span">inteligencia artificial</GradientText>.
                  </h1>
                  <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65">
                    Atiende llamadas, gestiona reservas, procesa pedidos, cobra con Stripe, recuerda a cada cliente
                    y nunca se cansa — sin nómina ni errores.
                  </p>
                  <ul className="mt-7 space-y-2 text-sm text-white/75">
                    {['Disponible 24/7 · 365 días', 'Hasta 20 llamadas simultáneas', 'Memoria de clientes con RGPD', 'Integración web + WhatsApp', 'Desde 150€/mes'].map((b) => (
                      <li key={b} className="flex items-center gap-2">
                        <span className="relative inline-flex h-2 w-2">
                          <span className="absolute inset-0 rounded-full bg-emerald-400/60 animate-pulse-dot" />
                          <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-9 flex flex-wrap gap-4">
                    <MagneticButton href="#demo" accent="green">
                      <Headphones size={16} /> Escuchar demo
                    </MagneticButton>
                    <MagneticButton href={ctaWa} target="_blank" rel="noreferrer" variant="secondary">
                      <MessageCircle size={16} /> Hablar por WhatsApp
                    </MagneticButton>
                  </div>
                </Reveal>
              </div>

              <Reveal>
                <BeamBorder rounded="rounded-[2rem]">
                  <div className="relative aspect-square overflow-hidden rounded-[2rem] holographic">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(16,185,129,0.35), transparent 60%), radial-gradient(circle at 70% 70%, rgba(139,92,246,0.4), transparent 60%)',
                      }}
                    />
                    <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
                      <defs>
                        <radialGradient id="phoneGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="rgba(16,185,129,0.6)" />
                          <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                        </radialGradient>
                      </defs>
                      <circle cx="200" cy="200" r="180" fill="url(#phoneGlow)" />
                      <g transform="translate(200,200)">
                        {[...Array(40)].map((_, i) => {
                          const angle = (i / 40) * Math.PI * 2;
                          const r1 = 60;
                          const r2 = 60 + Math.sin(i * 0.6) * 18 + 25;
                          const x1 = Math.cos(angle) * r1;
                          const y1 = Math.sin(angle) * r1;
                          const x2 = Math.cos(angle) * r2;
                          const y2 = Math.sin(angle) * r2;
                          return (
                            <line
                              key={i}
                              x1={x1} y1={y1} x2={x2} y2={y2}
                              stroke="#10B981"
                              strokeWidth="2"
                              strokeLinecap="round"
                              opacity={0.4 + Math.sin(i * 0.7) * 0.4}
                            >
                              <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${1.4 + (i % 3) * 0.3}s`} repeatCount="indefinite" />
                            </line>
                          );
                        })}
                      </g>
                      <g transform="translate(170,140)">
                        <rect x="0" y="0" width="60" height="120" rx="14" fill="rgba(7,5,14,0.85)" stroke="rgba(255,255,255,0.15)" />
                        <rect x="6" y="14" width="48" height="86" rx="6" fill="rgba(16,185,129,0.12)" />
                        <circle cx="30" cy="110" r="3" fill="rgba(255,255,255,0.4)" />
                      </g>
                    </svg>
                    <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-2xl glass-strong px-4 py-3">
                      <div className="relative inline-flex h-2 w-2">
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-dot" />
                      </div>
                      <span className="text-xs text-white/80">Llamada en curso · 03:42</span>
                    </div>
                  </div>
                </BeamBorder>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <div className="mb-12 max-w-2xl">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">El problema</p>
                <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                  Cada llamada perdida<br />
                  <span style={{ color: 'var(--danger)' }}>es un cliente regalado a la competencia.</span>
                </h2>
              </div>
            </Reveal>
            <RevealGroup className="grid gap-5 md:grid-cols-3">
              {[
                { t: 'Llamadas perdidas', d: 'Cada llamada no contestada es un cliente que llama a la competencia. El 62% no vuelven a intentarlo.' },
                { t: 'Tiempo del equipo', d: 'Gestionar reservas, preguntas repetidas y pedidos consume horas que podrían dedicarse al negocio.' },
                { t: 'Coste laboral', d: 'Un recepcionista cuesta entre 1.200€ y 1.800€/mes, solo en horario laboral, con bajas y vacaciones.' },
              ].map((c) => (
                <RevealItem key={c.t}>
                  <div className="rounded-2xl glass p-7">
                    <h3 className="font-display text-xl text-white">{c.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{c.d}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
            <Reveal>
              <div className="mt-10 rounded-2xl border-l-4 p-7" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'var(--accent-ia)' }}>
                <p className="text-base text-white/85">
                  <span className="text-2xl">💡</span>{' '}
                  <span className="font-semibold">La solución existe.</span>{' '}
                  Un agente de IA conectado a tu negocio vía n8n puede hacer todo eso — y mucho más — por <span className="font-mono" style={{ color: 'var(--accent-ia)' }}>150€/mes</span>.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* DEMO */}
        <section id="demo" className="py-24">
          <div className="mx-auto max-w-4xl px-6">
            <Reveal>
              <BeamBorder rounded="rounded-[2.5rem]">
                <Holographic className="p-8 md:p-12" rounded="rounded-[2.5rem]">
                  <div className="mb-7 flex items-center justify-between">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--accent-ia)' }}>
                        ● Demo en vivo
                      </p>
                      <h2 className="font-display text-3xl md:text-4xl text-white" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                        Llamada real con un agente
                      </h2>
                    </div>
                    <div className="hidden font-mono text-xs text-white/50 md:block">~5 min</div>
                  </div>
                  <p className="mb-8 max-w-xl text-sm leading-relaxed text-white/65">
                    Llamada real entre Andreh (Latech) y un agente IA durante varios minutos.
                    Escucha la naturalidad, los tiempos de respuesta y la fluidez de la conversación.
                  </p>
                  <AudioPlayer src="/audio/agente-demo.mp4" />
                </Holographic>
              </BeamBorder>
            </Reveal>
          </div>
        </section>

        {/* Features bento */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <div className="mb-14 max-w-2xl">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Capacidades</p>
                <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                  Lo que <span style={{ color: 'var(--accent-ia)' }}>puede hacer</span>.
                </h2>
              </div>
            </Reveal>
            <RevealGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <RevealItem key={f.title}>
                    <div className="h-full rounded-2xl glass p-7 transition-transform hover:-translate-y-1">
                      <div
                        className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--accent-ia)', border: '1px solid rgba(16,185,129,0.3)' }}
                      >
                        <Icon size={20} strokeWidth={1.6} />
                      </div>
                      <h3 className="font-display text-xl text-white">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">{f.desc}</p>
                      <div className="mt-5 inline-flex rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-wider" style={{ borderColor: 'rgba(16,185,129,0.3)', color: 'var(--accent-ia)', background: 'rgba(16,185,129,0.08)' }}>
                        {f.badge}
                      </div>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>
        </section>

        {/* Comparativa */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <div className="mb-12 text-center">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Comparativa</p>
                <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                  Recepcionista humano <span className="text-white/40">vs</span><br />
                  <span style={{ color: 'var(--accent-ia)' }}>Agente IA con n8n</span>
                </h2>
              </div>

              <div className="overflow-hidden rounded-3xl glass">
                <div className="grid grid-cols-2 border-b text-xs uppercase tracking-wider text-white/40" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="px-6 py-4">Recepcionista humano</div>
                  <div className="px-6 py-4 text-right" style={{ background: 'rgba(16,185,129,0.05)', color: 'var(--accent-ia)' }}>Agente IA con n8n</div>
                </div>
                {COMPARATIVA.map((row, i) => (
                  <div key={i} className="grid grid-cols-2 border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-3 px-6 py-4 text-sm text-white/45">
                      <X size={16} className="shrink-0 text-red-400/70" />
                      <span className="line-through decoration-red-400/40">{row.human}</span>
                    </div>
                    <div className="flex items-center justify-end gap-3 px-6 py-4 text-right text-sm text-white" style={{ background: 'rgba(16,185,129,0.05)' }}>
                      <span>{row.ia}</span>
                      <Check size={16} className="shrink-0" style={{ color: 'var(--accent-ia)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Sectores */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <div className="mb-10 text-center">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Sectores</p>
                <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                  Donde <span style={{ color: 'var(--accent-ia)' }}>funciona</span>.
                </h2>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {SECTORES.map((s) => (
                  <span
                    key={s}
                    className="rounded-full px-5 py-2.5 text-sm transition-colors hover:text-white"
                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', color: 'rgba(255,255,255,0.7)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Lo que obtienes */}
        <section className="py-24">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <div className="rounded-3xl glass p-8 md:p-14">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Lo que obtienes</p>
                <h2 className="font-display text-3xl md:text-4xl text-white" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                  Todo incluido. Sin extras escondidos.
                </h2>
                <ul className="mt-8 grid gap-3 md:grid-cols-2">
                  {OBTIENES.map((o) => (
                    <li key={o} className="flex items-start gap-3 text-sm text-white/85">
                      <span
                        className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ background: 'rgba(16,185,129,0.18)', color: 'var(--accent-ia)' }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* En menos de 72h */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <div className="mb-12 max-w-2xl">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Implementación</p>
                <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                  En menos de <span style={{ color: 'var(--accent-ia)' }}>72 horas</span>.
                </h2>
              </div>
            </Reveal>
            <RevealGroup className="grid gap-5 md:grid-cols-4">
              {STEPS.map((s) => (
                <RevealItem key={s.n}>
                  <div className="h-full rounded-2xl glass p-7">
                    <div className="mb-4 font-mono text-xs" style={{ color: 'var(--accent-ia)' }}>{s.n}</div>
                    <h3 className="font-display text-lg text-white">{s.t}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{s.d}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Pricing final */}
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <BeamBorder rounded="rounded-[2rem]">
                <Holographic className="relative flex flex-col p-8 md:p-12" rounded="rounded-[2rem]">
                  <div className="mb-7 flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                      style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--accent-ia)', border: '1px solid rgba(16,185,129,0.4)' }}
                    >
                      <Bot size={12} /> Agente IA · Plan Inicial
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="text-base text-white/50">Desde</span>
                    <span className="font-display ml-3 text-7xl font-bold leading-none text-white tabular-nums">150€</span>
                    <span className="ml-2 text-base text-white/50">/mes</span>
                  </div>
                  <p className="mb-2 text-sm text-white/60">Configuración: a convenir según complejidad</p>
                  <p className="mb-8 text-sm text-white/60">Sin permanencia · Sin instalación · Soporte español · RGPD</p>

                  <ul className="mb-10 space-y-3">
                    {[
                      'Agente conversacional con voz natural personalizada',
                      'Hasta 20 llamadas simultáneas, 24/7/365',
                      'Memoria de clientes con base de datos segura RGPD',
                      'Integración con WhatsApp Business, email y Stripe',
                      'Widget de llamada por voz para tu web',
                      'Panel con histórico, transcripciones y métricas',
                      'Mejora continua semanal',
                    ].map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/85">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(16,185,129,0.18)', color: 'var(--accent-ia)' }}>
                          <Check size={12} strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <MagneticButton
                    href={STRIPE_LINKS.ia || ctaWa}
                    target="_blank"
                    rel="noreferrer"
                    accent="green"
                    className="!py-4 !text-base"
                  >
                    Solicitar demo personalizada <ArrowRight size={18} />
                  </MagneticButton>
                  <p className="mt-5 text-center text-xs leading-relaxed text-white/45">
                    El precio final depende del volumen de llamadas e integraciones específicas. Te enviamos presupuesto en 24h.
                  </p>
                </Holographic>
              </BeamBorder>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
