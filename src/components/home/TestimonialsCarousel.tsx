'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Reveal } from '../effects/Reveal';

const TESTIMONIALS = [
  { name: 'Carmen R.', role: 'Propietaria', company: 'Peluquería Carmen · Badajoz', text: 'En 48h tenía web nueva, reservas online y mi ficha de Google brillando. Las reservas han subido un 60%.', rating: 5 },
  { name: 'Javier M.', role: 'Chef y dueño', company: 'Restaurante La Colmena', text: 'El agente IA atiende todas las reservas mientras servimos. No perdemos una llamada. Pagado en el primer mes.', rating: 5 },
  { name: 'Laura S.', role: 'CEO', company: 'Boutique Olivia', text: 'La tienda online quedó preciosa, súper rápida y vende sola. Stripe y Bizum integrados desde el primer día.', rating: 5 },
  { name: 'Fernando T.', role: 'Abogado', company: 'Despacho Torres & Asoc.', text: 'Cero tecnicismos en la conversación. Se nota que entienden el negocio, no solo la tecnología.', rating: 5 },
  { name: 'Andrea P.', role: 'Fundadora', company: 'Estudio Wellness', text: 'Mi web anterior tardaba 8 segundos en cargar. La nueva, menos de 1. Las reservas se han disparado.', rating: 5 },
  { name: 'David L.', role: 'Mecánico jefe', company: 'Talleres Hermanos López', text: 'Pensaba que esto del IA era humo. Ahora atiende citas, manda recordatorios y mis clientes encantados.', rating: 5 },
];

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ background: 'var(--grad-signature)', boxShadow: '0 0 0 2px rgba(255,255,255,0.05)' }}
    >
      {initials}
    </div>
  );
}

export default function TestimonialsCarousel() {
  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-16 max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Testimonios</p>
            <h2 className="font-display text-balance text-4xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
              Quien lo prueba,<br /><span style={{ color: 'var(--purple-300)' }}>repite.</span>
            </h2>
          </div>
        </Reveal>
      </div>

      <motion.div
        className="flex cursor-grab gap-5 px-6 pb-2 active:cursor-grabbing md:px-12"
        drag="x"
        dragConstraints={{ left: -1500, right: 0 }}
        whileTap={{ cursor: 'grabbing' }}
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.06 }}
            className="flex w-[340px] shrink-0 flex-col rounded-3xl glass p-6 md:w-[400px]"
          >
            <div className="mb-4 flex gap-0.5">
              {Array.from({ length: t.rating }).map((_, k) => (
                <Star key={k} size={14} fill="currentColor" style={{ color: 'var(--warning)' }} className="stroke-0" />
              ))}
            </div>
            <p className="flex-1 text-base leading-relaxed text-white/85">&ldquo;{t.text}&rdquo;</p>
            <div className="mt-6 flex items-center gap-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <Avatar name={t.name} />
              <div>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-white/50">{t.role} · {t.company}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
