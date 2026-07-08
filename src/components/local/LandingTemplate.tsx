import Link from 'next/link';
import { ArrowRight, MessageCircle, MapPin } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MagneticButton from '@/components/effects/MagneticButton';
import { Reveal } from '@/components/effects/Reveal';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { renderMarkdown } from '@/lib/markdown';
import { whatsappLink } from '@/lib/stripe-links';
import { localServiceJsonLd, faqJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { getCity, getLanding, SERVICE_LABEL, type LocalLanding } from '@/content/local';

const SERVICE_CTA: Record<string, string> = {
  'diseno-web': '/tienda/web',
  'tienda-online': '/tienda/online',
  'agente-ia': '/tienda/agente-ia',
};

/** Guías del blog relacionadas con cada servicio (enlazado contextual). */
const SERVICE_GUIDES: Record<string, { href: string; label: string }[]> = {
  'diseno-web': [
    { href: '/blog/elegir-empresa-diseno-web', label: 'Cómo elegir empresa de diseño web sin equivocarte' },
    { href: '/blog/web-actual-perdiendo-clientes', label: 'Por qué tu web actual está perdiendo clientes' },
  ],
  'tienda-online': [
    { href: '/blog/elegir-empresa-diseno-web', label: 'Cómo elegir empresa de diseño web sin equivocarte' },
    { href: '/blog/agencia-vs-freelancer-vs-diy', label: 'Agencia, freelancer o hacerlo tú mismo: qué conviene' },
  ],
  'agente-ia': [
    { href: '/blog/agente-ia-voz-vs-chatbot', label: 'Agente de voz vs chatbot: cuál necesita tu negocio' },
    { href: '/blog/agentes-ia-n8n-pymes', label: 'Agentes de IA con n8n para pymes, explicados' },
  ],
};

/** Proyectos reales como prueba social en las landing locales. */
const PROOF_PROJECTS = [
  { name: 'Zona Sport', detail: 'tienda de deportes con catálogo online (Badajoz)' },
  { name: 'Panelex', detail: 'web industrial B2B que capta leads en toda España' },
  { name: 'Toldos Noa', detail: 'servicios con presupuestos por WhatsApp (Madrid y Tarragona)' },
];

export default function LandingTemplate({ landing }: { landing: LocalLanding }) {
  const city = getCity(landing.citySlug)!;
  const path = `/${landing.service}/${landing.citySlug}`;
  const html = renderMarkdown(landing.bodyMarkdown);
  const label = SERVICE_LABEL[landing.service];
  // Solo enlazamos ciudades cercanas que TIENEN landing en este servicio: con
  // dynamicParams=false, enlazar a una que no existe (p. ej. Mérida en tienda
  // online) daría un 404 rastreable. Evita enlaces rotos y crawl waste.
  const nearbyWithLanding = city.nearby.filter((n) => getLanding(landing.service, n));

  return (
    <>
      <JsonLd
        data={localServiceJsonLd({
          serviceName: `${label} en ${city.name}`,
          description: landing.description,
          path,
          city: city.name,
          region: city.region,
        })}
      />
      <JsonLd data={faqJsonLd(landing.faq)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: label, path: SERVICE_CTA[landing.service] },
          { name: city.name, path },
        ])}
      />
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground intensity="subtle" />
      <MouseGlow />
      <main className="relative z-10">
        <section className="pt-44 pb-10">
          <div className="mx-auto max-w-3xl px-6">
            <Breadcrumbs
              items={[
                { name: 'Inicio', path: '/' },
                { name: label, path: SERVICE_CTA[landing.service] },
                { name: city.name, path },
              ]}
            />
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs text-white/55">
                <MapPin size={12} /> {city.name} · {city.region}
              </span>
              <h1
                className="mt-5 font-display text-balance text-4xl md:text-6xl"
                style={{ letterSpacing: '-0.04em', fontWeight: 800, lineHeight: 1.05 }}
              >
                {landing.h1}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/65">{landing.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <MagneticButton href={SERVICE_CTA[landing.service]}>
                  Ver planes <ArrowRight size={14} />
                </MagneticButton>
                <MagneticButton
                  href={whatsappLink(`Hola, soy de ${city.name} y me interesa ${label.toLowerCase()}`)}
                  target="_blank"
                  rel="noreferrer"
                  variant="secondary"
                >
                  <MessageCircle size={14} /> Hablar
                </MagneticButton>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="pb-10">
          <div className="mx-auto max-w-3xl px-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {landing.sectores.map((s) => (
                <div key={s.nombre} className="rounded-2xl glass p-5">
                  <h3 className="font-display text-lg text-white">{s.nombre}</h3>
                  <p className="mt-2 text-sm text-white/60">{s.gancho}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-14">
          <div className="mx-auto max-w-3xl px-6">
            <div className="prose-latech" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </section>

        <section className="pb-14">
          <div className="mx-auto max-w-3xl px-6">
            <div className="rounded-3xl glass p-6 md:p-8">
              <h2 className="font-display text-2xl" style={{ letterSpacing: '-0.03em', fontWeight: 800 }}>
                Proyectos reales, no promesas
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-white/65">
                {PROOF_PROJECTS.map((pr) => (
                  <li key={pr.name}>
                    <strong className="text-white">{pr.name}</strong> — {pr.detail}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-white/65">
                <Link href="/proyectos" className="text-white/80 underline hover:text-white">
                  Ver todos los proyectos en producción
                </Link>{' '}
                y comprueba cómo trabajamos antes de decidir.
              </p>
              {SERVICE_GUIDES[landing.service] && (
                <div className="mt-5 border-t pt-4 text-sm text-white/55" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Guías útiles: </span>
                  {SERVICE_GUIDES[landing.service].map((g, i) => (
                    <span key={g.href}>
                      {i > 0 && ' · '}
                      <Link href={g.href} className="text-white/70 underline hover:text-white">
                        {g.label}
                      </Link>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="mx-auto max-w-3xl px-6">
            <h2
              className="mb-6 font-display text-3xl"
              style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
            >
              Preguntas frecuentes
            </h2>
            <div className="flex flex-col gap-3">
              {landing.faq.map((f) => (
                <details key={f.q} className="rounded-2xl glass p-5">
                  <summary className="cursor-pointer font-medium text-white">{f.q}</summary>
                  <p className="mt-3 text-sm text-white/60">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="mx-auto max-w-3xl px-6 text-sm text-white/55">
            <span>También hacemos {label.toLowerCase()} en: </span>
            {nearbyWithLanding.map((n, i) => (
              <span key={n}>
                {i > 0 && ' · '}
                <Link href={`/${landing.service}/${n}`} className="text-white/70 underline hover:text-white">
                  {getCity(n)?.name ?? n}
                </Link>
              </span>
            ))}
            {nearbyWithLanding.length > 0 && ' · '}
            <Link href="/cobertura" className="text-white/70 underline hover:text-white">
              toda España
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
