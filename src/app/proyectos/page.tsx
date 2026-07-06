import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, MapPin, Briefcase } from 'lucide-react';
import AuroraBackground from '@/components/effects/AuroraBackground';
import MouseGlow from '@/components/effects/MouseGlow';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Reveal, RevealGroup, RevealItem } from '@/components/effects/Reveal';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { breadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Proyectos: webs reales hechas para empresas',
  description:
    '14 webs en producción hechas por Latech: Zona Sport, Panelex, Toldos Noa y más. Tiendas online, restauración, industria y servicios de toda España.',
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
    id: 'zonasport',
    name: 'Zona Sport',
    url: 'https://zonasport.vercel.app/',
    domain: 'zonasport.vercel.app',
    sector: 'Tienda de deportes multimarca online',
    location: 'Puebla de la Calzada (Badajoz)',
    description:
      'Tienda de deportes multimarca con solera —desde 1998— en Puebla de la Calzada. Web con catálogo online amplio por categorías (mujer, hombre, niño, niña, bebé, complementos y outlet), marcas como Babolat, Joluvi, Ditchil o Jhayber, blog de consejos y un panel de gestión interno que unifica el inventario. Atención y pedidos por WhatsApp con recogida en tienda, pensada para que el cliente local compre cómodo online sin perder el trato de siempre. Pádel, running, montaña y fitness, todo en una sola tienda.',
    image: '/proyectos/zonasport.jpg',
  },
  {
    id: 'sear',
    name: 'SEAR',
    url: 'https://hamburguesa.vercel.app/',
    domain: 'hamburguesa.vercel.app',
    sector: 'Hamburguesería premium (smash burgers)',
    location: 'España',
    description:
      'Hamburguesería premium de smash burgers con una web tan apetecible como su producto. Fotografía de alta calidad, carta digital con alérgenos, horarios, reservas y carrito de pedido, sobre un diseño oscuro y cuidado con un montaje visual de la hamburguesa por capas que enamora antes de morder. Pensada para convertir el antojo en pedido o reserva en pocos clics, con una identidad de marca fuerte que destaca en un sector saturado.',
    image: '/proyectos/sear.jpg',
  },
  {
    id: 'panelex',
    name: 'Panelex',
    url: 'https://panelexpanelsandwich.com/',
    domain: 'panelexpanelsandwich.com',
    sector: 'Fábrica de panel sándwich (construcción)',
    location: 'Extremadura (Badajoz)',
    description:
      'Fábrica de panel sándwich en Extremadura con una web B2B potente y muy trabajada en SEO. Catálogo técnico de productos (cubierta, fachada, frigorífico) con fichas y datos estructurados que Google muestra como fragmentos de producto, decenas de guías técnicas, calculadora y landings por provincia para captar en toda España. Diseño industrial y sobrio orientado a constructoras, naves agrícolas e instaladores que necesitan medir, comparar y pedir presupuesto. Una máquina de captación de leads para venta de material de construcción.',
    image: '/proyectos/panelex.webp',
  },
  {
    id: 'the-boat-house',
    name: 'The Boat House',
    url: 'https://ibizarestaurante.vercel.app/es',
    domain: 'ibizarestaurante.vercel.app',
    sector: 'Restaurante de alta cocina mediterránea',
    location: 'Cala San Vicente, Ibiza',
    description:
      'Alta cocina mediterránea en el norte de Ibiza con una web que es una experiencia inmersiva de scroll: arranca con 40 años de historia familiar y desciende «bajo la superficie» hasta el fondo del mar, donde reposan los platos y la carta —un guiño perfecto a su cocina hiperlocal de producto del día y km 0. Cocina moderna y orgánica (paella melosa, tomahawk gallego madurado, wagyu, curry de pescado), reservas online, catering para barcos y soporte en 6 idiomas. Para un público internacional y navegante que busca una experiencia gastronómica premium frente al mar.',
    image: '/proyectos/the-boat-house.png',
  },
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
    url: 'https://toldosnoa.com/',
    domain: 'toldosnoa.com',
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
  {
    id: 'industrial-fighters',
    name: 'Industrial Fighters',
    url: 'https://industrial-fighters.vercel.app/',
    domain: 'industrial-fighters.vercel.app',
    sector: 'Equipamiento artesanal para deportes de combate',
    location: 'España',
    description:
      'Marca española de equipamiento de combate fabricado a medida: shorts de Muay Thai, guantes de boxeo y MMA, camisetas técnicas y bucales personalizados con bordado de nombres, banderas y emblemas. La web está montada como un combate por «rounds», con estética oscura y directa, portfolio de trabajos reales y pedidos cerrados por WhatsApp sin formularios. Pensada para gimnasios, equipos y luchadores que buscan material artesanal, con garantía de costura y envío 24-48h a península.',
    image: '/proyectos/industrial-fighters.png',
  },
  {
    id: 'proyecto-1',
    name: 'Proyecto 1',
    url: 'https://ropasergi.vercel.app/',
    domain: 'ropasergi.vercel.app',
    sector: 'Boutique multimarca de moda de lujo',
    location: 'Tarragona',
    description:
      'Boutique multimarca de lujo con chándales y prendas de Versace, Louis Vuitton, Gucci, Dior o Prada y relojería Rolex. Diseño minimalista y conceptual, con manifiesto de marca, números romanos y un tono provocador que rompe con el comercio convencional («0 rebajas falsas»). Incluye tienda online con catálogo filtrable, sistema de «drops» con acceso anticipado 24h y newsletter exclusiva. Dirigida a un público joven, sofisticado y de alto poder adquisitivo que valora la autenticidad y el producto seleccionado.',
    image: '/proyectos/proyecto-1.png',
  },
  {
    id: 'french-tacos',
    name: 'CLM French Tacos',
    url: 'https://frenchtacos.vercel.app/',
    domain: 'frenchtacos.vercel.app',
    sector: 'Comida rápida urbana — french tacos, burgers y bowls',
    location: 'Ciudad Real',
    description:
      'Restaurante de comida rápida urbana especializado en «french tacos», con burgers, bowls, ensaladas y menús infantiles. Identidad joven y callejera —«nacido en Francia, criado en la calle»— con tipografía bold, fotografía de producto apetecible y carruseles por categorías. Carta digital con precios, horarios hasta medianoche, pedidos integrados con Glovo y enlaces directos a teléfono, Instagram y Google Maps. Pensada para un público joven y nocturno que busca comida rápida diferente y pedir desde el móvil.',
    image: '/proyectos/french-tacos.png',
  },
  {
    id: 'el-refugio-de-a-cabana',
    name: 'El Refugio de A Cabana',
    url: 'https://elrefugiodeacabana.vercel.app/',
    domain: 'elrefugiodeacabana.vercel.app',
    sector: 'Restaurante de cocina gallega tradicional',
    location: 'A Cabana, Ferrol (Galicia)',
    description:
      'Cocina gallega tradicional con la filosofía del «lugar donde se está bien». Apuesta por la cocina lenta y el producto local comprado cada mañana: pulpo a la gallega, raxo al queso, zorza, tortilla y helados artesanos. Diseño cálido y minimalista con tonos tierra, buena fotografía gastronómica, historia del local, galería y testimonios. Incluye reservas online y CTAs claros para reservar o llamar. Pensada para vecinos, familias y visitantes que buscan gastronomía gallega auténtica sin artificios.',
    image: '/proyectos/el-refugio-de-a-cabana.png',
  },
  {
    id: 'maison-noir',
    name: 'Maison Noir',
    url: 'https://mixelin.vercel.app/',
    domain: 'mixelin.vercel.app',
    sector: 'Alta cocina francesa (fine dining)',
    location: 'París (concepto)',
    description:
      'Concepto de restaurante de alta cocina francesa con tres estrellas Michelin ambientado en Saint-Germain (París). Diseño elegante y teatral: interfaz oscura, fotografía en blanco y negro, tipografía serif y una «Carte Vivante» interactiva para explorar los menús degustación. Reservas online con disponibilidad en tiempo real, calendario de 90 días, información «en vivo» del servicio y newsletter estacional. Una pieza de escaparate que demuestra hasta dónde puede llegar Latech en proyectos de lujo.',
    image: '/proyectos/maison-mixelin.png',
  },
];

export default function ProyectosPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Proyectos de Latech en producción',
          numberOfItems: PROJECTS.length,
          itemListElement: PROJECTS.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.name,
            url: p.url,
          })),
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Proyectos', path: '/proyectos' },
        ])}
      />
      <Navbar />
      <main className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--bg-base)' }}>
        <AuroraBackground />
        <MouseGlow />

        {/* === Header === */}
        <section className="relative px-6 pt-36 pb-12 md:px-10 md:pt-44 md:pb-16">
          <div className="mx-auto max-w-5xl">
            <Breadcrumbs
              items={[
                { name: 'Inicio', path: '/' },
                { name: 'Proyectos', path: '/proyectos' },
              ]}
            />
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
                Cada proyecto que hacemos lo cuidamos como si fuera nuestro. Estos son catorce
                proyectos que ya tienen su web en producción con Latech. Pulsa cualquiera
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
