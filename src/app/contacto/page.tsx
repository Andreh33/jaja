import type { Metadata } from 'next';
import { MapPin, Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee, Marquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal } from '@/components/effects/Reveal';
import GradientText from '@/components/effects/GradientText';
import Holographic from '@/components/effects/Holographic';
import ContactForm from './ContactForm';
import MapWrapper from '@/components/shared/MapWrapper';
import { whatsappLink } from '@/lib/stripe-links';

export const metadata: Metadata = {
  title: 'Contacto · Hablemos',
  description: 'Estamos en Calle Puente 3, Puebla de la Calzada · Badajoz. Llámanos, escríbenos o ven a vernos.',
};

export default function ContactoPage() {
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
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Contacto</p>
              <h1 className="font-display text-balance text-5xl md:text-7xl" style={{ letterSpacing: '-0.04em', fontWeight: 800, lineHeight: 1 }}>
                <GradientText as="span">Hablemos</GradientText>.
              </h1>
              <p className="mx-auto mt-7 max-w-xl text-base text-white/65">
                Cuéntanos qué necesitas. Te respondemos en menos de 24h con propuesta clara, tiempos reales y precio fijo.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2">
            <Reveal>
              <Holographic className="p-8 md:p-10" rounded="rounded-3xl">
                <h2 className="font-display text-2xl text-white" style={{ letterSpacing: '-0.03em', fontWeight: 700 }}>
                  Envíanos un mensaje
                </h2>
                <p className="mt-2 text-sm text-white/55">Respondemos siempre en menos de 24 horas hábiles.</p>
                <div className="mt-7">
                  <ContactForm />
                </div>
              </Holographic>
            </Reveal>

            <Reveal>
              <div className="space-y-4">
                <a href={whatsappLink('Hola, me gustaría hablar con Latech')} target="_blank" rel="noreferrer" className="block rounded-3xl glass p-6 transition-transform hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'rgba(37,211,102,0.15)', color: '#25D366', border: '1px solid rgba(37,211,102,0.3)' }}>
                      <MessageCircle size={20} strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-white">WhatsApp</h3>
                      <p className="mt-1 text-sm text-white/60">La forma más rápida de contactar. Respuesta en horas, no días.</p>
                      <p className="mt-2 font-mono text-sm text-white/85">+34 684 73 90 91</p>
                    </div>
                  </div>
                </a>

                <a href="tel:+34684739091" className="block rounded-3xl glass p-6 transition-transform hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--purple-300)', border: '1px solid rgba(139,92,246,0.3)' }}>
                      <Phone size={20} strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-white">Teléfono</h3>
                      <p className="mt-1 text-sm text-white/60">Para charla directa o cosas urgentes.</p>
                      <p className="mt-2 font-mono text-sm text-white/85">+34 684 73 90 91</p>
                    </div>
                  </div>
                </a>

                <a href="mailto:info@latech.es" className="block rounded-3xl glass p-6 transition-transform hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--accent-shop)', border: '1px solid rgba(249,115,22,0.3)' }}>
                      <Mail size={20} strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-white">Email</h3>
                      <p className="mt-1 text-sm text-white/60">Para enviar documentación, propuestas o reuniones.</p>
                      <p className="mt-2 font-mono text-sm text-white/85">info@latech.es</p>
                    </div>
                  </div>
                </a>

                <div className="rounded-3xl glass p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <MapPin size={20} strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-white">Dirección</h3>
                      <p className="mt-1 text-sm text-white/60">Reuniones presenciales bajo cita previa.</p>
                      <p className="mt-2 text-sm text-white/85">Calle Puente 3<br />06490 Puebla de la Calzada · Badajoz</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl glass p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--purple-300)', border: '1px solid rgba(139,92,246,0.3)' }}>
                      <Clock size={20} strokeWidth={1.6} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-white">Horarios</h3>
                      <p className="mt-2 font-mono text-xs text-white/75">
                        Lunes a Viernes&ensp;9:00 – 14:00 · 16:00 – 19:00<br />
                        Sábados&ensp;10:00 – 14:00<br />
                        Domingos&ensp;cerrado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <div className="overflow-hidden rounded-3xl glass">
                <MapWrapper />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-12">
          <div className="border-y" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-elevated)' }}>
            <div className="py-7" style={{ background: 'var(--grad-signature)' }}>
              <Marquee speed={45}>
                {['BADAJOZ', 'PUEBLA DE LA CALZADA', 'EXTREMADURA', 'DISPONIBLES PARA NUEVOS PROYECTOS'].map((t, i) => (
                  <span key={i} className="flex items-center gap-8 pl-8 font-bold tracking-[0.2em]" style={{ fontSize: 13, color: '#070510' }}>
                    {t}
                    <span style={{ color: '#070510' }}>✦</span>
                  </span>
                ))}
              </Marquee>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
