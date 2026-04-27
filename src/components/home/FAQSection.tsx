'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from '../effects/Reveal';

const FAQS = [
  { q: '¿Cuánto tarda en estar lista mi web?', a: 'Entre 24 y 48 horas desde que recibimos toda la información (textos, fotos, logo, datos de contacto). En proyectos más grandes (tiendas con catálogo extenso) puede llegar a 72h.' },
  { q: '¿Hay permanencia?', a: 'No. Nunca. Puedes dejar el servicio cuando quieras. Si te vas, te llevas tu código, tu dominio y todos tus datos sin trabas.' },
  { q: '¿Qué incluye el SEO?', a: 'Análisis de competencia local, optimización técnica completa (Core Web Vitals, schema markup, sitemap), palabras clave geolocalizadas y estructura semántica. Te dejamos posicionado para que el contenido futuro multiplique resultados.' },
  { q: '¿Y el dominio? ¿Hay que comprarlo aparte?', a: 'Te asesoramos en la elección y configuración del dominio. Si ya lo tienes, nosotros lo configuramos. Si no, te ayudamos a comprarlo (suele costar 10-15€/año aparte).' },
  { q: '¿El hosting es seguro?', a: 'Sí. Trabajamos sobre Vercel con SSL automático, CDN global, backups diarios y headers de seguridad correctamente configurados. Es la misma infraestructura que usan empresas como OpenAI o Notion.' },
  { q: '¿Qué pasa si quiero cambios?', a: 'Cambios menores (textos, imágenes, ajustes de diseño puntuales) están incluidos cada mes. Cambios grandes (nuevas secciones, funcionalidades extra) son proyectos aparte y te pasamos presupuesto antes.' },
  { q: '¿Funciona el agente IA con mi número actual?', a: 'Sí. Configuramos el desvío desde tu número actual al agente. Para tus clientes nada cambia: te siguen llamando al mismo número. La diferencia es que ahora alguien siempre contesta.' },
  { q: '¿Aceptáis facturas? ¿Con IVA?', a: 'Sí. Toda la facturación es transparente, con IVA, y emitida desde España. Compatible con autónomos y empresas.' },
  { q: '¿Atendéis fuera de Badajoz?', a: 'Sí, en toda España. Las reuniones se hacen por videollamada. Si tu negocio está en Badajoz capital o alrededores, también podemos vernos en persona.' },
  { q: '¿Hay reuniones presenciales?', a: 'Si quieres, sí. Estamos en Calle Puente 3, Puebla de la Calzada. Pero la mayoría de nuestros clientes prefieren la videollamada por comodidad.' },
];

function Item({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: i * 0.04 }}
      className="overflow-hidden rounded-2xl border transition-colors"
      style={{
        background: open ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
        borderColor: open ? 'var(--border-glow)' : 'var(--border-subtle)',
      }}
    >
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
      >
        <span className="text-sm font-medium text-white md:text-base">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <Plus size={18} className="text-white/60" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pr-12 text-sm leading-relaxed text-white/65">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="relative z-10 py-32">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <div className="mb-16 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">FAQ</p>
            <h2 className="font-display text-balance text-4xl md:text-6xl" style={{ letterSpacing: '-0.04em', fontWeight: 800 }}>
              Las preguntas<br />
              <span style={{ color: 'var(--purple-300)' }}>que recibimos siempre.</span>
            </h2>
          </div>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <Item key={i} {...f} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
