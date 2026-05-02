import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, MapPin, Briefcase } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal, RevealGroup, RevealItem } from '@/components/effects/Reveal';

export const metadata: Metadata = {
  title: 'Proyectos · Algunos de los negocios que confían en Latech',
  description:
    'Cada proyecto que hacemos lo cuidamos como si fuera nuestro. Webs reales en producción para tienda, restauración, automoción, servicios y obra civil.',
  alternates: {
    canonical: '/proyectos',
  },
};

type Project = {
  id: string;
  name: string;
  url: string;
  domain: string;
  sector: string;
  location: string;
  description: string;
  image: string;
};

const PROJECTS: Project[] = [
  {
    id: 'monopatinmonkey',
    name: 'Monopatín Monkey',
    url: 'https://monopatinmonkey.com/',
    domain: 'monopatinmonkey.com',
    sector: 'Tienda y reparación de patinetes eléctricos',
    location: 'Tarragona',
    description:
      'Tienda online completa para una marca con identidad joven y urbana. Catálogo real con fichas detalladas de cada modelo, sección dedicada al servicio de reparación con proceso explicado paso a paso, y diseño moderno que conecta con el público de movilidad eléctrica. Pensada para vender en Tarragona y servir online, con UX clara para que el cliente compare modelos y pida cita de taller sin fricciones.',
    image: '/proyectos/monopatinmonkey.png',
  },
  {
    id: 'toldos-noa',
    name: 'Toldos Noa',
    url: 'https://toldos-noa.vercel.app/',
    domain: 'toldos-noa.vercel.app',
    sector: 'Toldos a medida e instalación',
    location: 'Madrid y Tarragona',
    description:
      'Web orientada a generar contactos cualificados directamente por WhatsApp. Cuatro líneas de servicio bien diferenciadas (hogar, negocios, reparaciones, a medida), reseñas reales que aportan confianza y CTAs siempre apuntando a solicitar presupuesto. Estructura simple y directa, pensada para que un visitante con una necesidad concreta —reparar un toldo, encargar uno nuevo— llegue al WhatsApp del equipo en menos de tres clics.',
    image: '/proyectos/toldos-noa.png',
  },
  {
    id: 'autoselect-sevilla',
    name: 'Autoselect Sevilla',
    url: 'https://democoches.vercel.app/',
    domain: 'democoches.vercel.app',
    sector: 'Concesionario premium de coches de segunda mano',
    location: 'Sevilla',
    description:
      'Catálogo de vehículos con fichas profesionales (kilometraje, transmisión, año, combustible y estado), proceso de compra explicado en tres pasos claros, simulador de financiación y servicio de tasación del coche actual del cliente. La estética es premium y cuidada, coherente con un ticket alto y un público que necesita confianza visual antes de pisar el concesionario. Optimizada para que cada modelo sea fácil de filtrar, comparar y reservar.',
    image: '/proyectos/autoselect-sevilla.png',
  },
  {
    id: 'pruden-hijos',
    name: 'Pruden e Hijos',
    url: 'https://pruden-wine.vercel.app/',
    domain: 'pruden-wine.vercel.app',
    sector: 'Movimientos de tierra, áridos y transporte pesado',
    location: 'Chillón (Ciudad Real)',
    description:
      'Web corporativa para una empresa con 25 años de trayectoria y más de 500 proyectos ejecutados. Cinco líneas de servicio bien explicadas (movimientos de tierra, excavaciones, transportes pesados, suministro de áridos y tratamientos bituminosos), proceso de trabajo detallado y formulario directo para solicitar presupuesto. Diseño profesional y técnico orientado a constructoras, administraciones e industria — el visitante entiende el alcance del servicio y contacta sin rodeos.',
    image: '/proyectos/pruden-hijos.png',
  },
  {
    id: 'meson-casa-andres',
    name: 'Mesón Casa Andrés',
    url: 'https://demo-restaurante-meson.vercel.app/',
    domain: 'demo-restaurante-meson.vercel.app',
    sector: 'Mesón de cocina tradicional extremeña',
    location: 'Trujillo (Cáceres)',
    description:
      'Web pensada para un mesón con tres generaciones detrás (1958) en pleno centro histórico de Trujillo. Carta digital con recetas clásicas (migas, cocido, ibéricos a la brasa de encina), historia familiar contada con calidez, galería del local y reservas en línea. El tono es cálido y nostálgico, alineado con el "lo de siempre, hecho como siempre" que esperan tanto turistas gastronómicos como clientela local fiel. Sirve para llenar mesa sin depender de plataformas terceras.',
    image: '/proyectos/meson-casa-andres.png',
  },
];

export default function ProyectosPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-base)' }}>
        <AuroraBackground />
        <MouseGlow />

        {/* === Header === */}
        <section className="relative px-6 pt-36 pb-12 md:px-10 md:pt-44 md:pb-16">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
                Cómo trabajamos
              </p>
              <h1
                className="font-display text-4xl text-white md:text-6xl"
                style={{ letterSpacing: '-0.04em', fontWeight: 800 }}
              >
                Algunos de los negocios que ya confían en nosotros
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
                Cada proyecto que hacemos lo cuidamos como si fuera nuestro. Estos son cinco
                negocios reales que ya tienen su web en producción con Latech. Pulsa cualquiera
                para visitarla.
              </p>
            </Reveal>
          </div>
        </section>

        {/* === Grid === */}
        <section className="relative px-6 pb-24 md:px-10 md:pb-32">
          <div className="mx-auto max-w-7xl">
            <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.map((p) => (
                <RevealItem key={p.id}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visitar ${p.domain} en una pestaña nueva`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl glass transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    {/* Preview imagen */}
                    <div
                      className="relative aspect-[16/10] w-full overflow-hidden border-b"
                      style={{ borderColor: 'var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}
                    >
                      <Image
                        src={p.image}
                        alt={`Captura de la web ${p.domain}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      <span
                        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: 'rgba(7,5,14,0.75)', backdropFilter: 'blur(10px)' }}
                      >
                        Ver web <ArrowUpRight size={11} />
                      </span>
                    </div>

                    {/* Contenido */}
                    <div className="flex flex-1 flex-col p-6">
                      <h2
                        className="font-display text-xl text-white"
                        style={{ letterSpacing: '-0.02em', fontWeight: 700 }}
                      >
                        {p.name}
                      </h2>
                      <p className="mt-1 font-mono text-[11px] text-white/40">{p.domain}</p>

                      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-white/55">
                        <span className="inline-flex items-center gap-1.5">
                          <Briefcase size={11} className="text-white/40" />
                          {p.sector}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={11} className="text-white/40" />
                          {p.location}
                        </span>
                      </div>

                      <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70">
                        {p.description}
                      </p>

                      <span
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/85 transition-colors group-hover:text-white"
                        style={{ color: 'var(--accent-calc)' }}
                      >
                        Visitar {p.domain}
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </a>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
