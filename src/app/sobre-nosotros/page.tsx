import type { Metadata } from 'next';
import { Heart, Shield, Award, Code2, Sparkles } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee, Marquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal, RevealGroup, RevealItem } from '@/components/effects/Reveal';
import GradientText from '@/components/effects/GradientText';
import MagneticButton from '@/components/effects/MagneticButton';
import { whatsappLink } from '@/lib/stripe-links';

export const metadata: Metadata = {
  title: 'Sobre nosotros · Tu socio tecnológico en Badajoz',
  description: 'Latech: equipo técnico en Badajoz especializado en diseño web, e-commerce, SEO y agentes de IA con n8n para empresas que quieren crecer.',
};

const VALORES = [
  { icon: Heart, t: 'Cercanía', d: 'Trato directo, sin intermediarios. Hablas siempre con quien va a tocar el código de tu proyecto.' },
  { icon: Shield, t: 'Confianza', d: 'Sin permanencia, código transferible y precios públicos. Sin candados ni sorpresas.' },
  { icon: Award, t: 'Calidad', d: 'Stack moderno, atención al detalle y compromiso con que cada entrega esté técnicamente impecable.' },
];

const TECHS = ['Next.js', 'React', 'TypeScript', 'n8n', 'OpenAI', 'Stripe', 'Vercel', 'Turso', 'Tailwind', 'Framer Motion', 'GSAP', 'Anthropic'];

export default function SobreNosotrosPage() {
  return (
    <>
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground />
      <MouseGlow />
      <main className="relative z-10">
        <section className="pt-44 pb-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Reveal>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Quiénes somos</p>
              <h1 className="font-display text-balance text-5xl md:text-7xl" style={{ letterSpacing: '-0.04em', fontWeight: 800, lineHeight: 0.98 }}>
                Tu socio tecnológico<br />
                en <GradientText as="span">Badajoz</GradientText>.
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-base text-white/65">
                Diseño web, SEO, e-commerce y soluciones de IA para empresas que quieren crecer.
                Cercanos, transparentes y obsesionados con que tu proyecto funcione de verdad.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Long content */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-6">
            <article className="prose-latech max-w-none">
              <Reveal>
                <h2>En Latech somos&hellip;</h2>
                <p>
                  ...un equipo técnico apasionado por construir productos digitales que funcionan de verdad.
                  Trabajamos desde Badajoz para empresas y emprendedores que buscan algo más que una web bonita:
                  buscan una herramienta que les genere clientes, ventas y diferenciación frente a la competencia.
                </p>
                <p>
                  Nacimos de una idea simple: en una época donde cualquiera ofrece &ldquo;diseño web&rdquo;,
                  la diferencia ya no es saber programar — es <strong>entender el negocio</strong> del cliente,
                  aplicar las herramientas técnicas adecuadas y entregar rápido, bien y sin complicaciones.
                </p>
              </Reveal>

              <Reveal>
                <h2>Diseño web que genera resultados</h2>
                <p>
                  No hacemos webs genéricas. Cada proyecto empieza con una conversación de 15 minutos donde
                  entendemos a qué se dedica el cliente, qué tipo de usuario le compra, qué objeciones encuentra
                  y qué le diferencia de su competencia. Solo entonces diseñamos.
                </p>
                <p>
                  Trabajamos con stack moderno (Next.js, React, Tailwind, Vercel) — la misma tecnología que utilizan
                  empresas como OpenAI, Notion o Linear. Esto significa webs <strong>extremadamente rápidas</strong>,
                  <strong> técnicamente impecables</strong> y preparadas para escalar contigo.
                </p>
                <p>
                  Cada web sale con SEO técnico completo, mobile-first, schema markup, sitemap optimizado y análisis
                  de la competencia local para identificar palabras clave reales que generen tráfico desde el primer mes.
                </p>
              </Reveal>

              <Reveal>
                <h2>Mantenimiento y seguridad sin sustos</h2>
                <p>
                  Una web no se entrega y se olvida. Nuestros planes incluyen monitorización continua, certificado SSL,
                  headers de seguridad correctamente configurados, protección DDoS y backups diarios. Todo desplegado
                  sobre infraestructura Vercel, con CDN global y uptime garantizado del 99.9%.
                </p>
                <p>
                  Y si algo se rompe — que pasará, porque el software es así — lo arreglamos rápido. Sin tickets,
                  sin colas, sin sistemas opacos. Un mensaje por WhatsApp y nos ponemos manos a la obra.
                </p>
              </Reveal>

              <Reveal>
                <h2>Soporte técnico cercano</h2>
                <p>
                  Aquí no hay agentes externalizados. Cuando preguntas algo, te responde la persona que conoce tu proyecto.
                  Cambios menores incluidos cada mes (textos, imágenes, ajustes puntuales), respuesta en menos de 24h
                  y siempre por canales humanos: WhatsApp, email o llamada.
                </p>
                <p>
                  Lo que prometemos lo cumplimos. Lo que no podemos cumplir, lo decimos antes de aceptar el proyecto.
                  Suena básico, pero en este sector es revolucionario.
                </p>
              </Reveal>

              <Reveal>
                <h2>Nuestro enfoque</h2>
                <p>
                  Creemos que la tecnología debe ser una palanca para el negocio, no un obstáculo.
                  Por eso simplificamos al máximo: <strong>precios públicos</strong>, <strong>sin permanencia</strong>,
                  <strong> código transferible</strong> y entregas rápidas. Si quieres irte, te llevas todo.
                  Si quieres quedarte, lo haces porque cumplimos.
                </p>
                <p>
                  Y vamos un paso más allá: somos pioneros en España integrando agentes de IA con n8n
                  para pequeñas y medianas empresas. Mientras la mayoría sigue hablando de IA en abstracto,
                  nosotros llevamos meses construyendo asistentes que atienden llamadas reales,
                  gestionan reservas y procesan pagos por voz.
                </p>
              </Reveal>

              <Reveal>
                <h2>Tu aliado tecnológico</h2>
                <p>
                  Si buscas una empresa que entregue rápido, hable claro y cumpla lo prometido,
                  estamos disponibles. Y si solo quieres pedir consejo o resolver una duda técnica,
                  escríbenos por WhatsApp y te respondemos en horas, no en días.
                </p>
              </Reveal>
            </article>

            <Reveal>
              <div className="mt-12 flex flex-wrap gap-4">
                <MagneticButton href={whatsappLink('Hola, quiero conocer más sobre Latech')} target="_blank" rel="noreferrer">
                  <Sparkles size={16} /> Hablar con nosotros
                </MagneticButton>
                <MagneticButton href="/tienda" variant="secondary">
                  Ver planes
                </MagneticButton>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Valores */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <div className="mb-14 text-center">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Valores</p>
                <h2 className="font-display text-4xl md:text-5xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
                  Lo que nos define
                </h2>
              </div>
            </Reveal>
            <RevealGroup className="grid gap-5 md:grid-cols-3">
              {VALORES.map((v) => {
                const Icon = v.icon;
                return (
                  <RevealItem key={v.t}>
                    <div className="h-full rounded-3xl glass p-8 text-center">
                      <div className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--purple-300)', border: '1px solid rgba(139,92,246,0.3)' }}>
                        <Icon size={22} strokeWidth={1.6} />
                      </div>
                      <h3 className="font-display text-2xl text-white">{v.t}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-white/60">{v.d}</p>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>
        </section>

        {/* Tech */}
        <section className="py-16">
          <Reveal>
            <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              <Code2 size={12} className="mr-2 inline" /> Stack tecnológico
            </p>
          </Reveal>
          <Marquee speed={45}>
            {TECHS.map((t, i) => (
              <span key={i} className="flex items-center gap-10 pl-10 font-mono text-2xl text-white/30 hover:text-white/80">
                {t}<span className="inline-block h-1.5 w-1.5 rounded-full bg-white/15" />
              </span>
            ))}
          </Marquee>
        </section>
      </main>
      <Footer />
    </>
  );
}
