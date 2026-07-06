import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import { SignatureMarquee } from '@/components/effects/Marquee';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal } from '@/components/effects/Reveal';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { landingsFor, getCity, SERVICE_LABEL, type Service } from '@/content/local';
import { SITE_URL, breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  // Distinto del title del home para no competir por la misma búsqueda.
  title: 'Cobertura: diseño web y tiendas online por ciudades',
  description:
    'Elige tu ciudad y tu servicio: diseño web, tienda online o agente de IA en Madrid, Barcelona, Valencia, Sevilla y toda España. En remoto, en 24-48h.',
  alternates: { canonical: `${SITE_URL}/cobertura` },
};

const SERVICES: Service[] = ['diseno-web', 'tienda-online', 'agente-ia'];

export default function CoberturaPage() {
  const allItems = SERVICES.flatMap((service) =>
    landingsFor(service).map((l) => ({
      service,
      citySlug: l.citySlug,
      name: `${SERVICE_LABEL[service]} en ${getCity(l.citySlug)?.name ?? l.citySlug}`,
    })),
  );
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Servicios de Latech por ciudad',
          numberOfItems: allItems.length,
          itemListElement: allItems.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            url: `${SITE_URL}/${item.service}/${item.citySlug}`,
          })),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Cobertura', path: '/cobertura' },
        ])}
      />
      <SignatureMarquee />
      <Navbar />
      <AuroraBackground intensity="subtle" />
      <MouseGlow />
      <main className="relative z-10">
        <section className="pt-44 pb-12">
          <div className="mx-auto max-w-5xl px-6">
            <Breadcrumbs
              items={[
                { name: 'Inicio', path: '/' },
                { name: 'Cobertura', path: '/cobertura' },
              ]}
            />
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs text-white/55">
                <MapPin size={12} /> Cobertura nacional
              </span>
              <h1
                className="mt-5 font-display text-balance text-4xl md:text-6xl"
                style={{ letterSpacing: '-0.04em', fontWeight: 800, lineHeight: 1.05 }}
              >
                Trabajamos para empresas de toda España
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
                Somos un equipo de Extremadura que diseña webs, tiendas online y agentes de IA en
                remoto, por videollamada, con entrega en 24-48h y sin permanencia. Elige tu ciudad y
                tu servicio.
              </p>
            </Reveal>
          </div>
        </section>

        {SERVICES.map((service) => {
          const items = landingsFor(service);
          if (items.length === 0) return null;
          return (
            <section key={service} className="pb-14">
              <div className="mx-auto max-w-5xl px-6">
                <h2
                  className="mb-6 font-display text-2xl md:text-3xl"
                  style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
                >
                  {SERVICE_LABEL[service]} por ciudad
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {items.map((l) => (
                    <Link
                      key={l.citySlug}
                      href={`/${service}/${l.citySlug}`}
                      className="rounded-xl glass px-4 py-3 text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {SERVICE_LABEL[service]} en {getCity(l.citySlug)?.name ?? l.citySlug}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </main>
      <Footer />
    </>
  );
}
