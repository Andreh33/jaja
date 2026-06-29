import type { LocalLanding } from './types';

// NOTA: 'madrid' es el piloto verificado. Las 14 ciudades restantes las generan
// subagentes Opus 4.8 + ultrathink (Plan Task 4) con contenido único por ciudad.
export const landings: LocalLanding[] = [
  {
    service: 'diseno-web',
    citySlug: 'madrid',
    title: 'Diseño web en Madrid · entrega 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Madrid: webs rápidas, optimizadas para Google y sin permanencia. Trabajamos en remoto con entrega en 24-48h.',
    h1: 'Diseño web profesional en Madrid',
    intro:
      'En Madrid compites con webs potentes: cadenas, franquicias y agencias con presupuestos enormes. Una web lenta o anticuada te deja fuera antes de la primera llamada. Diseñamos webs rápidas, claras y pensadas para convertir, sin que pagues la oficina cara de una agencia del centro: somos un equipo de Extremadura que trabaja para toda España por videollamada, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Servicios profesionales', gancho: 'Despachos, consultoras y clínicas que necesitan transmitir autoridad y captar por Google.' },
      { nombre: 'Hostelería y comercio', gancho: 'Cartas, reservas y SEO local para destacar en un mercado saturado.' },
      { nombre: 'Startups y tecnológicas', gancho: 'Landing rápidas que convierten tráfico de campañas en clientes.' },
      { nombre: 'Pymes industriales y B2B', gancho: 'Webs que generan confianza y peticiones de presupuesto, no solo folletos.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Madrid sin estar allí físicamente?', a: 'Sí. Trabajamos 100% en remoto por videollamada con clientes de todo Madrid y de toda España. Te ahorras el sobrecoste de una agencia con oficina en el centro y ganas la misma cercanía: reuniones por videollamada y respuesta rápida.' },
      { q: '¿Cuánto tardáis en entregar una web en Madrid?', a: 'La mayoría de proyectos se entregan en 24-48h una vez tenemos tus contenidos. Para webs más grandes, definimos un calendario claro desde el primer día.' },
      { q: '¿La web estará optimizada para posicionar en Google en Madrid?', a: 'Sí. Cada web se entrega con SEO técnico, velocidad optimizada (Core Web Vitals), datos estructurados y enfoque en las búsquedas locales de Madrid relevantes para tu sector.' },
      { q: '¿Hay permanencia o cuotas obligatorias?', a: 'No hay permanencia. La web es tuya. El mantenimiento es opcional.' },
    ],
    bodyMarkdown: `## Por qué tu web importa más en Madrid

Madrid concentra la mayor competencia de España en casi cualquier sector. Cuando un cliente busca en Google, compara tres o cuatro resultados en segundos y se queda con el que mejor entra por los ojos y más rápido carga. Si tu web tarda, no se ve bien en el móvil o no transmite confianza, ese cliente se va a la competencia aunque tu servicio sea mejor.

Nuestro enfoque es simple: una web que **carga al instante, se entiende en cinco segundos y empuja a la acción** (llamar, escribir, comprar). Sin florituras que ralentizan, sin plantillas genéricas que se ven en mil sitios.

## Qué incluimos

- Diseño a medida con tu identidad, no una plantilla reciclada.
- Velocidad y Core Web Vitals optimizados (clave para posicionar y convertir).
- SEO técnico de base: datos estructurados, metadatos, sitemap.
- Adaptada al móvil de verdad, donde está la mayoría de tu tráfico.
- Textos orientados a convertir, no a rellenar.

Mira los planes y precios en [diseño web](/tienda/web), o cuéntanos tu caso y te asesoramos sin compromiso.

## La ventaja de trabajar en remoto

No necesitas pagar la estructura de una agencia con oficina en plena Gran Vía. Somos un equipo de Extremadura que trabaja para empresas de toda España: misma calidad, reuniones por videollamada, entrega en 24-48h y un precio sin el recargo de la oficina cara. Para muchas pymes de Madrid, esa es la diferencia entre tener una web profesional ya o seguir aplazándola.

Si además quieres vender online o automatizar la atención al cliente, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia) que atienda llamadas y mensajes por ti.`,
  },
];
