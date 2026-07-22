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
  {
    service: 'diseno-web',
    citySlug: 'barcelona',
    title: 'Diseño web en Barcelona · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Barcelona: turismo, tecnología, diseño y comercio. Webs rápidas, optimizadas para Google y sin permanencia.',
    h1: 'Diseño web profesional en Barcelona',
    intro:
      'Barcelona vive del turismo, del comercio, del diseño y de un ecosistema tecnológico que crece sin parar entre el 22@ y los grandes congresos como el Mobile World Congress. En una ciudad donde la imagen lo es todo y entra mucho cliente internacional, una web pobre te resta credibilidad al instante. Diseñamos webs rápidas, cuidadas y multilingües cuando hace falta, en remoto y con entrega en 24-48h, sin permanencia.',
    sectores: [
      { nombre: 'Turismo y hostelería', gancho: 'Hoteles, restaurantes y experiencias que reciben público nacional e internacional y necesitan reservas claras.' },
      { nombre: 'Tecnología y startups', gancho: 'Webs y landings rápidas para el ecosistema del 22@ que convierten tráfico de campañas e inversión en clientes.' },
      { nombre: 'Diseño, moda y creatividad', gancho: 'Estudios y marcas que necesitan una web tan cuidada como su trabajo.' },
      { nombre: 'Comercio y retail', gancho: 'Tiendas de barrio y cadenas que quieren aparecer en las búsquedas locales de cada distrito.' },
      { nombre: 'Logística y B2B', gancho: 'Empresas ligadas al puerto y a la exportación que necesitan transmitir solvencia.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Barcelona sin oficina en la ciudad?', a: 'Sí. Trabajamos 100% en remoto por videollamada con clientes de toda Barcelona y de Cataluña. Te ahorras el recargo de una agencia con oficina en el Eixample o el 22@ y mantienes la misma cercanía y rapidez.' },
      { q: '¿Podéis hacer la web en catalán, castellano e inglés?', a: 'Sí. Para un mercado tan internacional como el de Barcelona preparamos webs multilingües bien estructuradas para SEO, con etiquetas hreflang y navegación clara en cada idioma.' },
      { q: '¿Cuánto tardáis en entregar la web?', a: 'La mayoría de proyectos se entregan en 24-48h una vez tenemos tus textos e imágenes. Para webs grandes con varios idiomas fijamos un calendario desde el principio.' },
      { q: '¿La web posicionará en las búsquedas locales de Barcelona?', a: 'Sí. Trabajamos SEO técnico, velocidad y datos estructurados, y orientamos los contenidos a las búsquedas de tu sector y de tu zona o distrito.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia ni cuotas obligatorias. El mantenimiento es opcional.' },
    ],
    bodyMarkdown: `## Barcelona: una ciudad donde la web es tu escaparate internacional

Pocas ciudades españolas reciben tanto público de fuera como Barcelona. Turistas, congresistas del Mobile World Congress, nómadas digitales, inversores que miran el ecosistema del 22@... Mucha de esa gente te va a conocer primero por el móvil y en otro idioma. Si tu web carga lenta, no está traducida o parece de hace diez años, pierdes la oportunidad antes de la primera conversación.

Diseñamos webs pensadas para ese contexto: **rápidas, claras, multilingües cuando hace falta y orientadas a que el visitante haga algo** (reservar, escribir, comprar). Sin plantillas recicladas que se ven en cualquier parte.

## Sectores que movemos en Barcelona

### Turismo y hostelería
Un hotel boutique del Born o un restaurante del Eixample compiten en buscadores y en plataformas con cientos de opciones. Una web propia, rápida y con reserva directa te libera de comisiones y te da control sobre tu imagen.

### Tecnología y startups del 22@
El distrito tecnológico de Barcelona concentra startups que necesitan landings que conviertan tráfico de campañas y rondas en clientes reales. Trabajamos velocidad, claridad de mensaje y medición desde el primer día.

### Diseño, moda y creatividad
Si tu trabajo es visual, tu web no puede ser menos. Cuidamos tipografía, ritmo y carga de imágenes para que tu portfolio luzca sin penalizar la velocidad.

## Qué incluimos en cada web

- Diseño a medida con tu identidad, no una plantilla.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico: datos estructurados, metadatos, sitemap y, si procede, multilingüe con hreflang.
- Adaptada al móvil, donde está la mayoría de tu tráfico turístico y local.
- Textos orientados a convertir.

Puedes ver planes y precios en [diseño web](/tienda/web) o contarnos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No necesitas pagar la estructura de una agencia con oficina en pleno Passeig de Gràcia. Somos un equipo de Extremadura que trabaja para empresas de toda España y Cataluña: misma calidad, reuniones por videollamada, entrega en 24-48h y un precio sin el recargo de una agencia del centro de Barcelona.

Si además quieres vender online o automatizar reservas y consultas, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia) que atienda en varios idiomas.`,
  },
  {
    service: 'diseno-web',
    citySlug: 'valencia',
    title: 'Diseño web en Valencia · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Valencia: agroalimentario, cerámica, mueble, comercio y exportación. Webs rápidas y sin permanencia.',
    h1: 'Diseño web profesional en Valencia',
    intro:
      'Valencia mueve agro y cítricos, cerámica y azulejo, mueble, hábitat y un comercio muy vivo, con un puerto que es puerta de exportación al Mediterráneo. Mucha de esa actividad es exportadora y B2B, donde el cliente te juzga por tu web antes de descolgar el teléfono. Diseñamos webs rápidas, en castellano y valenciano si lo necesitas, orientadas a generar confianza y pedidos. En remoto, entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Agroalimentario y cítricos', gancho: 'Cooperativas, exportadoras y marcas de producto que necesitan transmitir calidad y origen.' },
      { nombre: 'Cerámica, azulejo y hábitat', gancho: 'Empresas de azulejo, mueble e iluminación que venden a distribuidores y estudios de toda Europa.' },
      { nombre: 'Comercio y hostelería', gancho: 'Negocios de ciudad y de playa que quieren aparecer en las búsquedas locales y captar reservas.' },
      { nombre: 'Logística y exportación', gancho: 'Empresas ligadas al puerto que necesitan una web seria para clientes internacionales.' },
      { nombre: 'Servicios profesionales', gancho: 'Despachos y consultoras que captan por Google y necesitan autoridad.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Valencia sin estar allí?', a: 'Sí. Trabajamos 100% en remoto por videollamada con clientes de Valencia y de toda la Comunidad Valenciana. Te ahorras el coste de una agencia con oficina y mantienes la cercanía y la rapidez.' },
      { q: '¿Podéis hacer la web bilingüe en valenciano y castellano?', a: 'Sí, y también en inglés u otros idiomas si exportas. Preparamos versiones bien estructuradas para SEO con hreflang.' },
      { q: '¿Sirve para empresas exportadoras y B2B?', a: 'Sí. Muchas empresas valencianas venden a distribuidores y mercados exteriores. Diseñamos webs que transmiten solvencia, con catálogo, fichas técnicas y formularios de contacto claros para captar pedidos.' },
      { q: '¿Cuánto tardáis en entregar?', a: 'La mayoría de webs se entregan en 24-48h una vez tenemos tus contenidos. Para catálogos grandes definimos un calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. El mantenimiento es opcional.' },
    ],
    bodyMarkdown: `## Valencia: web para una economía exportadora

La provincia de Valencia es una potencia productiva: cítricos y agroalimentario, el clúster cerámico y del azulejo, el mueble y el hábitat, y un puerto que es una de las grandes puertas de exportación del Mediterráneo. Mucha de esta actividad es **B2B y exportadora**, y ahí la web cumple una función concreta: que un comprador de Alemania, Francia o de otra parte de España te encuentre, entienda qué fabricas y confíe lo bastante como para pedir presupuesto.

Si tu web es lenta, no tiene fichas claras o no está en su idioma, ese comprador pasa al siguiente proveedor. Diseñamos webs que **transmiten solvencia y facilitan el contacto comercial**.

## Sectores que movemos en Valencia

### Agroalimentario y cítricos
Cooperativas y exportadoras que necesitan contar origen, calidad y certificaciones. Una web cuidada vende confianza antes de la primera muestra.

### Cerámica, azulejo y hábitat
El producto valenciano de azulejo, mueble e iluminación se vende a distribuidores y estudios de interiorismo de toda Europa. Trabajamos catálogos navegables, fichas técnicas y galerías que cargan rápido aunque tengan muchas imágenes.

### Comercio y hostelería
Del centro de Valencia a la zona de playa, los negocios locales compiten en Google. Optimizamos para búsquedas de barrio y para captar reservas directas sin comisiones.

## Qué incluimos

- Diseño a medida con tu identidad.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico: datos estructurados, metadatos, sitemap y multilingüe si exportas.
- Catálogo y fichas técnicas pensados para B2B cuando hace falta.
- Adaptada al móvil y a la tablet del comprador profesional.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en el centro de Valencia. Somos un equipo de Extremadura que trabaja para toda España: reuniones por videollamada, entrega en 24-48h y un precio ajustado. Para una pyme exportadora valenciana, eso significa tener ya una web a la altura de su producto.

Si quieres vender directamente o automatizar el contacto comercial, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'sevilla',
    title: 'Diseño web en Sevilla · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Sevilla: turismo, aeronáutica, agroalimentario y servicios. Webs rápidas, optimizadas y sin permanencia.',
    h1: 'Diseño web profesional en Sevilla',
    intro:
      'Sevilla combina un turismo que no para con un tejido industrial potente alrededor de la aeronáutica del polígono Aerópolis, el agroalimentario y un sector servicios que crece como capital de Andalucía. Es una ciudad donde conviven la pyme tradicional y la empresa tecnológica, y todas necesitan una web que cargue rápido y transmita seriedad. La diseñamos en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Turismo y hostelería', gancho: 'Hoteles, restaurantes y experiencias del casco histórico que necesitan reservas directas y SEO local.' },
      { nombre: 'Aeronáutica e industria', gancho: 'Empresas y auxiliares del clúster de Aerópolis que venden B2B y necesitan transmitir rigor técnico.' },
      { nombre: 'Agroalimentario', gancho: 'Aceite, productos de la campiña y marcas que cuentan origen y calidad.' },
      { nombre: 'Servicios profesionales', gancho: 'Despachos, consultoras y clínicas de la capital que captan por Google.' },
      { nombre: 'Eventos y cultura', gancho: 'Negocios ligados a ferias, congresos y celebraciones que necesitan webs claras de reserva.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Sevilla en remoto?', a: 'Sí. Trabajamos 100% por videollamada con clientes de Sevilla y de toda Andalucía. Te ahorras el coste de una agencia con oficina y mantienes la cercanía.' },
      { q: '¿Sirve para empresas industriales y aeronáuticas B2B?', a: 'Sí. Para el tejido de Aerópolis y la industria auxiliar diseñamos webs que transmiten rigor técnico, con catálogo, certificaciones y fichas claras para captar clientes profesionales.' },
      { q: '¿Optimizáis para el turismo y la hostelería?', a: 'Sí. Trabajamos reserva directa y SEO local para que un hotel o restaurante del centro de Sevilla aparezca cuando alguien busca dónde dormir o comer en la ciudad.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para proyectos grandes fijamos un calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## Sevilla: dos economías, una misma necesidad

En Sevilla conviven dos mundos. Por un lado, el turismo y la hostelería del casco histórico, que reciben visitantes todo el año y compiten por aparecer en Google y en las plataformas de reserva. Por otro, un tejido industrial serio: la **aeronáutica del polígono Aerópolis**, la industria auxiliar, el agroalimentario y un sector servicios que crece como capital andaluza. Aunque parezcan opuestos, comparten la misma necesidad: una web que cargue rápido y dé confianza.

Diseñamos webs adaptadas a cada caso, sin plantillas genéricas: **rápidas, claras y orientadas a que el visitante actúe** (reservar, pedir presupuesto, llamar).

## Sectores que movemos en Sevilla

### Turismo y hostelería
Un hotel del barrio de Santa Cruz o un restaurante junto a la Catedral viven de aparecer cuando alguien busca dónde alojarse o comer. Trabajamos reserva directa para reducir comisiones y SEO local para ganar visibilidad.

### Aeronáutica e industria auxiliar
El clúster de Aerópolis es uno de los polos aeronáuticos de Europa. Para estas empresas y sus proveedores, la web es una herramienta comercial B2B: catálogo, capacidades, certificaciones y un contacto claro que invite a pedir presupuesto.

### Agroalimentario
El aceite y los productos de la campiña sevillana se venden por origen y calidad. Una web cuidada cuenta esa historia y abre puertas a distribuidores y tiendas.

## Qué incluimos

- Diseño a medida con tu identidad.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico: datos estructurados, metadatos y sitemap.
- Enfoque B2B (catálogo y fichas) o turístico (reserva) según tu negocio.
- Adaptada al móvil.

Mira planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en el centro de Sevilla. Somos un equipo de Extremadura, vecinos del oeste, que trabaja para empresas de toda España y Andalucía: reuniones por videollamada, entrega en 24-48h y precio sin recargo de oficina.

Si quieres vender online o automatizar reservas y consultas, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'malaga',
    title: 'Diseño web en Málaga · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Málaga: turismo, hostelería, startups del PTA e inmobiliario. Webs rápidas, multilingües y sin permanencia.',
    h1: 'Diseño web profesional en Málaga',
    intro:
      'Málaga vive un momento dulce: turismo de Costa del Sol todo el año, un Parque Tecnológico de Andalucía que atrae startups y multinacionales tech, un sector inmobiliario muy internacional y una hostelería en plena ebullición. Es una ciudad donde mucho cliente llega de fuera y en otro idioma. Diseñamos webs rápidas y multilingües, en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Turismo y hostelería', gancho: 'Hoteles, chiringuitos y restaurantes de la Costa del Sol que necesitan reservas directas y SEO local.' },
      { nombre: 'Startups y tecnología del PTA', gancho: 'Landings rápidas para el ecosistema del Parque Tecnológico que convierten tráfico en clientes.' },
      { nombre: 'Inmobiliario internacional', gancho: 'Agencias que venden a comprador extranjero y necesitan webs multilingües con buscador de propiedades.' },
      { nombre: 'Comercio y servicios', gancho: 'Negocios locales que quieren aparecer en las búsquedas de cada barrio.' },
      { nombre: 'Audiovisual y creatividad', gancho: 'Productoras y estudios que necesitan una web tan cuidada como su trabajo.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Málaga en remoto?', a: 'Sí. Trabajamos 100% por videollamada con clientes de Málaga y de toda la Costa del Sol. Te ahorras el coste de una agencia con oficina y mantienes la cercanía.' },
      { q: '¿Podéis hacer webs multilingües para comprador extranjero?', a: 'Sí. En Málaga es clave. Preparamos webs en inglés, alemán y otros idiomas, bien estructuradas para SEO con hreflang, ideales para inmobiliarias y turismo.' },
      { q: '¿Sirve para una startup del Parque Tecnológico?', a: 'Sí. Diseñamos landings rápidas y medibles, pensadas para convertir tráfico de campañas e inversión en clientes reales.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para proyectos con buscador de propiedades o varios idiomas, fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## Málaga: una ciudad que mira al mundo

Pocas ciudades españolas crecen como Málaga. La Costa del Sol mantiene el turismo casi todo el año, el **Parque Tecnológico de Andalucía (PTA)** ha convertido a la ciudad en un polo tech que atrae startups y multinacionales, y el inmobiliario vende a comprador internacional de toda Europa. El denominador común: mucho cliente llega **de fuera y en otro idioma**, y te conoce primero por el móvil.

Si tu web no está traducida, carga lenta o parece antigua, pierdes a ese cliente al instante. Diseñamos webs **rápidas, multilingües y orientadas a convertir** ese tráfico internacional en reservas, contactos o ventas.

## Sectores que movemos en Málaga

### Turismo y hostelería de la Costa del Sol
Hoteles, apartamentos turísticos, chiringuitos y restaurantes compiten por aparecer en Google y en las plataformas. Una web propia con reserva directa te libera de comisiones y te da control sobre tu imagen.

### Startups y tecnología del PTA
El ecosistema del Parque Tecnológico necesita landings que conviertan. Trabajamos velocidad, claridad de propuesta de valor y medición desde el primer día.

### Inmobiliario internacional
Vender una propiedad a un comprador alemán o británico exige una web en su idioma, con buscador de inmuebles, fotos que cargan rápido y contacto fácil. Es uno de los casos donde más se nota una web bien hecha.

## Qué incluimos

- Diseño a medida con tu identidad.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico y multilingüe con hreflang.
- Reserva directa, buscador de propiedades o landing de conversión según tu negocio.
- Adaptada al móvil, donde está casi todo el tráfico turístico.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en el centro de Málaga o en la zona del PTA. Somos un equipo de Extremadura que trabaja para toda España: reuniones por videollamada, entrega en 24-48h y precio sin recargo de oficina.

Si quieres vender online o automatizar reservas y consultas en varios idiomas, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'zaragoza',
    title: 'Diseño web en Zaragoza · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Zaragoza: logística, automoción, industria y agroalimentario. Webs rápidas, B2B y sin permanencia.',
    h1: 'Diseño web profesional en Zaragoza',
    intro:
      'Zaragoza es un nudo logístico e industrial de primer orden: la plataforma PLAZA, la automoción de Figueruelas, la industria del metal y el agroalimentario aragonés. Su posición entre Madrid, Barcelona, Bilbao y Valencia la convierte en un punto estratégico para empresas B2B que mueven mercancía y maquinaria. Diseñamos webs que transmiten solvencia industrial y captan pedidos, en remoto y con entrega en 24-48h, sin permanencia.',
    sectores: [
      { nombre: 'Logística y transporte', gancho: 'Operadores ligados a PLAZA que necesitan una web seria para clientes nacionales e internacionales.' },
      { nombre: 'Automoción e industria auxiliar', gancho: 'Proveedores del entorno de Figueruelas que venden B2B y necesitan transmitir capacidad técnica.' },
      { nombre: 'Metal y maquinaria', gancho: 'Talleres e industria que captan clientes con catálogo y fichas técnicas claras.' },
      { nombre: 'Agroalimentario aragonés', gancho: 'Marcas y cooperativas que cuentan origen y calidad para abrir mercado.' },
      { nombre: 'Servicios y comercio', gancho: 'Negocios de la ciudad que quieren aparecer en las búsquedas locales.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Zaragoza en remoto?', a: 'Sí. Trabajamos 100% por videollamada con clientes de Zaragoza y de todo Aragón. Te ahorras el coste de una agencia con oficina y mantienes la cercanía.' },
      { q: '¿Sirve para una empresa industrial o logística B2B?', a: 'Sí. Es nuestro fuerte. Diseñamos webs que transmiten capacidad y solvencia, con catálogo, capacidades técnicas, certificaciones y formularios de presupuesto claros para captar clientes profesionales.' },
      { q: '¿La web posicionará en Google?', a: 'Sí. Trabajamos SEO técnico, velocidad y datos estructurados, orientados a las búsquedas de tu sector industrial o de servicios.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para catálogos grandes fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## Zaragoza: web para el nudo logístico e industrial de España

Zaragoza ocupa un lugar privilegiado en el mapa: a poco más de 300 km de Madrid, Barcelona, Bilbao y Valencia. Esa posición ha hecho de la ciudad un **nudo logístico e industrial** de primer nivel, con la plataforma PLAZA, la planta de automoción de Figueruelas, una potente industria del metal y un agroalimentario aragonés con marca propia.

La mayoría de estas empresas venden **B2B**: a otras empresas, operadores y distribuidores que comparan proveedores antes de llamar. En ese contexto, la web no es decoración, es una herramienta comercial. Si la tuya es lenta o parece amateur, das ventaja a la competencia.

## Sectores que movemos en Zaragoza

### Logística y transporte
El entorno de PLAZA concentra operadores que mueven mercancía por toda Europa. Una web clara, con tus servicios, cobertura y capacidades, genera confianza en el cliente que va a confiarte su carga.

### Automoción e industria auxiliar
Los proveedores del entorno de Figueruelas trabajan con exigencias de calidad altas. Diseñamos webs que transmiten esa capacidad técnica, con catálogo, procesos y certificaciones bien presentados.

### Metal, maquinaria y agroalimentario
Del taller del metal a la cooperativa agroalimentaria, todos necesitan que un cliente potencial entienda en segundos qué hacen y por qué confiar. Trabajamos fichas técnicas, catálogos navegables y un contacto que invite a pedir presupuesto.

## Qué incluimos

- Diseño a medida con tu identidad industrial.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico: datos estructurados, metadatos y sitemap.
- Catálogo, capacidades y fichas técnicas pensados para B2B.
- Adaptada al móvil y a la tablet del comprador profesional.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en el centro de Zaragoza. Somos un equipo de Extremadura que trabaja para toda España: reuniones por videollamada, entrega en 24-48h y precio ajustado. Para una pyme industrial aragonesa, eso es tener ya una web a la altura de su capacidad.

Si quieres vender online o automatizar la atención comercial, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'murcia',
    title: 'Diseño web en Murcia · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Murcia: agroalimentario, exportación hortofrutícola, conservas e industria auxiliar. Webs rápidas y sin permanencia.',
    h1: 'Diseño web profesional en Murcia',
    intro:
      'Murcia es la huerta de Europa: agroalimentario, exportación hortofrutícola, conservas y toda la industria auxiliar que gira alrededor (riego, packaging, maquinaria agrícola). Buena parte de esa actividad vende a cadenas y distribuidores europeos que exigen seriedad y trazabilidad. Diseñamos webs que transmiten calidad y profesionalidad exportadora, en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Agroalimentario y hortofrutícola', gancho: 'Productores y exportadores que venden a cadenas europeas y necesitan transmitir calidad y trazabilidad.' },
      { nombre: 'Conservas y transformados', gancho: 'Marcas de conserva y cuarta gama que cuentan origen y procesos a distribuidores.' },
      { nombre: 'Industria auxiliar agrícola', gancho: 'Riego, packaging y maquinaria que venden B2B con catálogo técnico claro.' },
      { nombre: 'Comercio y hostelería', gancho: 'Negocios locales que quieren aparecer en las búsquedas de la ciudad y la región.' },
      { nombre: 'Servicios profesionales', gancho: 'Despachos y consultoras que captan por Google.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Murcia en remoto?', a: 'Sí. Trabajamos 100% por videollamada con clientes de Murcia y de toda la Región. Te ahorras el coste de una agencia con oficina y mantienes la cercanía.' },
      { q: '¿Sirve para una exportadora hortofrutícola?', a: 'Sí, es uno de nuestros casos típicos. Diseñamos webs multilingües que transmiten calidad, certificaciones y trazabilidad, con catálogo de producto y contacto claro para compradores europeos.' },
      { q: '¿Podéis hacer la web en inglés y otros idiomas?', a: 'Sí. Para exportación preparamos versiones en inglés, francés, alemán u otros, bien estructuradas para SEO con hreflang.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para catálogos amplios fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## Murcia: web para la huerta de Europa

A Murcia la llaman la huerta de Europa con razón. Buena parte de las frutas y hortalizas que se consumen en el continente salen de aquí, y alrededor de ese agroalimentario se ha construido todo un ecosistema: **conservas y transformados, cuarta gama, riego, packaging y maquinaria agrícola**. Es una economía profundamente **exportadora**, que vende a cadenas de distribución y mayoristas de toda Europa.

Esos compradores son exigentes. Antes de pedirte una muestra, te buscan, miran tu web y juzgan si eres un proveedor serio. Si tu web es lenta, no está en su idioma o no transmite calidad y trazabilidad, pierdes la oportunidad. Diseñamos webs pensadas para **ganar esa confianza comercial**.

## Sectores que movemos en Murcia

### Agroalimentario y hortofrutícola
Productores y exportadores que necesitan contar origen, certificaciones, calendario de producto y capacidad. Una web cuidada y multilingüe abre puertas a compradores que ni te conocían.

### Conservas y transformados
Las marcas murcianas de conserva y cuarta gama compiten en lineales de toda Europa. La web cuenta la historia de marca y el proceso que hay detrás del producto.

### Industria auxiliar agrícola
Riego, invernaderos, packaging y maquinaria son negocios B2B donde manda la ficha técnica. Trabajamos catálogos navegables y contacto comercial claro.

## Qué incluimos

- Diseño a medida con tu identidad.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico y multilingüe con hreflang para exportación.
- Catálogo de producto, certificaciones y trazabilidad bien presentados.
- Adaptada al móvil y a la tablet del comprador profesional.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en el centro de Murcia. Somos un equipo de Extremadura, región igualmente agroalimentaria, que entiende bien tu sector y trabaja para toda España: reuniones por videollamada, entrega en 24-48h y precio ajustado.

Si quieres vender directamente o automatizar el contacto con compradores en varios idiomas, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'bilbao',
    title: 'Diseño web en Bilbao desde 600 € | Latech',
    description:
      'Diseño web en Bilbao desde 600 €, entrega en 24-48 h y sin permanencia. Trabajamos en remoto para industria, pymes y profesionales.',
    h1: 'Diseño web profesional en Bilbao',
    updatedAt: '2026-07-22',
    intro:
      'Bilbao y su entorno son el corazón industrial del País Vasco: ingeniería, máquina herramienta, siderurgia, energía y un sector de servicios avanzados B2B con vocación internacional. Es una economía de alto valor donde el cliente exige rigor y solvencia. Diseñamos webs que transmiten capacidad técnica y profesionalidad, en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Ingeniería y máquina herramienta', gancho: 'Empresas técnicas que venden a industria global y necesitan transmitir capacidad y precisión.' },
      { nombre: 'Industria y metalurgia', gancho: 'Fabricantes y auxiliares que captan clientes B2B con catálogo y capacidades claras.' },
      { nombre: 'Energía y servicios avanzados', gancho: 'Consultoras técnicas e ingenierías que necesitan autoridad y casos de éxito.' },
      { nombre: 'Servicios profesionales', gancho: 'Despachos, asesorías y consultoras que captan por Google y referencias.' },
      { nombre: 'Comercio y hostelería', gancho: 'Negocios de la ría que quieren aparecer en las búsquedas locales.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Bilbao en remoto?', a: 'Sí. Trabajamos 100% por videollamada con clientes de Bilbao y de todo Bizkaia. Te ahorras el coste de una agencia con oficina y mantienes la cercanía y la rapidez.' },
      { q: '¿Sirve para una empresa de ingeniería o industria B2B?', a: 'Sí, es nuestro terreno. Diseñamos webs que transmiten rigor técnico y solvencia, con capacidades, casos de éxito, certificaciones y un contacto claro para captar clientes industriales.' },
      { q: '¿Podéis hacer la web en euskera, castellano e inglés?', a: 'Sí. Preparamos webs multilingües bien estructuradas para SEO con hreflang, habituales en empresas vascas con clientes internacionales.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para proyectos técnicos amplios fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## ¿Cuánto cuesta una página web en Bilbao?

Una web profesional para una empresa de Bilbao cuesta **600 € de creación más 60 €/mes** con Latech: hosting, SEO técnico y mantenimiento incluidos, entrega en 24-48 h y sin permanencia. Trabajamos en remoto por videollamada y atendemos proyectos de toda Bizkaia.

## Bilbao: web para una economía industrial y técnica

Bilbao es uno de los grandes polos industriales de España. Alrededor de la ría se concentra **ingeniería, máquina herramienta, siderurgia, energía y servicios avanzados**, con un fuerte componente exportador y B2B. Es una economía de **alto valor añadido**, donde el cliente que te contrata es exigente y técnico: compara proveedores, mira certificaciones y juzga tu seriedad antes de la primera reunión.

En ese contexto, una web amateur te resta credibilidad. Diseñamos webs que **transmiten capacidad técnica y solvencia**, sin humo: claras, rápidas y orientadas a que un responsable de compras o un director técnico confíe en ti.

## Sectores que movemos en Bilbao

### Ingeniería y máquina herramienta
El sector vasco de máquina herramienta vende a industria de todo el mundo. La web tiene que comunicar precisión, capacidades y referencias. Trabajamos fichas técnicas, casos de éxito y un mensaje claro para un cliente que sabe lo que busca.

### Industria y metalurgia
Fabricantes y auxiliares que captan clientes B2B necesitan que su web explique procesos, capacidades productivas y certificaciones de calidad de forma ordenada y creíble.

### Energía y servicios avanzados
Consultoras técnicas e ingenierías se contratan por autoridad. Una web con casos, metodología y resultados bien presentados convierte visitas en peticiones de propuesta.

## Qué incluimos

- Diseño a medida con identidad industrial seria.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico y multilingüe con hreflang.
- Capacidades, casos de éxito y certificaciones bien estructurados.
- Adaptada al móvil y a la tablet del decisor profesional.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en pleno centro de Bilbao. Somos un equipo de Extremadura que trabaja para toda España: reuniones por videollamada, entrega en 24-48h y precio sin recargo de oficina. Para una empresa industrial de Bizkaia, eso significa una web a la altura de su exigencia técnica sin pagar de más.

Si quieres digitalizar pedidos o automatizar la atención técnica, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'alicante',
    title: 'Diseño web en Alicante · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Alicante: turismo, calzado, comercio e inmobiliario de costa. Webs rápidas, multilingües y sin permanencia.',
    h1: 'Diseño web profesional en Alicante',
    intro:
      'Alicante combina el turismo de la Costa Blanca con un tejido industrial cercano muy potente: el calzado de Elche y Elda, el juguete, el textil y el comercio. A eso se suma un inmobiliario muy internacional. Es una provincia donde conviven la marca exportadora y el negocio de playa, y todas necesitan una web rápida y, a menudo, multilingüe. La diseñamos en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Turismo y hostelería', gancho: 'Hoteles, apartamentos y restaurantes de la Costa Blanca que necesitan reservas directas y SEO local.' },
      { nombre: 'Calzado y textil', gancho: 'Marcas y fabricantes del entorno de Elche y Elda que venden a distribuidores y exportan.' },
      { nombre: 'Inmobiliario internacional', gancho: 'Agencias que venden a comprador extranjero y necesitan webs multilingües con buscador.' },
      { nombre: 'Comercio y juguete', gancho: 'Negocios y marcas que quieren visibilidad en buscadores y catálogo claro.' },
      { nombre: 'Servicios profesionales', gancho: 'Despachos y clínicas que captan por Google en la provincia.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Alicante en remoto?', a: 'Sí. Trabajamos 100% por videollamada con clientes de Alicante y de toda la provincia. Te ahorras el coste de una agencia con oficina y mantienes la cercanía.' },
      { q: '¿Sirve para una marca de calzado o textil que exporta?', a: 'Sí. Diseñamos webs multilingües con catálogo de producto, fichas y contacto para distribuidores, pensadas para abrir mercado fuera de España.' },
      { q: '¿Hacéis webs multilingües para el inmobiliario de costa?', a: 'Sí. Para comprador extranjero preparamos versiones en inglés, alemán u otros idiomas con buscador de propiedades, bien estructuradas para SEO con hreflang.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para catálogos o buscadores fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## Alicante: turismo de costa e industria exportadora

Alicante tiene dos motores. Por un lado, el **turismo de la Costa Blanca**, con hoteles, apartamentos y hostelería que reciben visitantes nacionales e internacionales buena parte del año. Por otro, un **tejido industrial cercano muy fuerte**: el calzado de Elche y Elda, el juguete, el textil y un comercio dinámico. Y, atravesándolo todo, un inmobiliario que vende a comprador extranjero.

En casi todos estos casos, el cliente llega **de fuera o compara online** antes de decidir. Una web lenta, sin traducir o anticuada te deja fuera. Diseñamos webs **rápidas, multilingües cuando hace falta y orientadas a convertir** ese tráfico en reservas, contactos o pedidos.

## Sectores que movemos en Alicante

### Turismo y hostelería
Un hotel de la playa de San Juan o un restaurante del casco antiguo viven de aparecer cuando alguien busca dónde alojarse o comer. Trabajamos reserva directa para reducir comisiones y SEO local.

### Calzado y textil
Las marcas y fabricantes del entorno de Elche y Elda venden a distribuidores y exportan. La web es su escaparate B2B: catálogo, fichas, colecciones y un contacto claro para abrir cuentas nuevas.

### Inmobiliario internacional
Vender a un comprador británico, belga o noruego exige una web en su idioma, con buscador de propiedades y fotos que cargan rápido. Es de los casos donde más se nota una web bien hecha.

## Qué incluimos

- Diseño a medida con tu identidad.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico y multilingüe con hreflang.
- Reserva directa, catálogo B2B o buscador de propiedades según tu negocio.
- Adaptada al móvil.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en el centro de Alicante. Somos un equipo de Extremadura que trabaja para toda España: reuniones por videollamada, entrega en 24-48h y precio ajustado.

Si quieres vender online o automatizar reservas y consultas en varios idiomas, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'cordoba',
    title: 'Diseño web en Córdoba · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Córdoba: joyería, agroalimentario, aceite y turismo patrimonial. Webs rápidas, cuidadas y sin permanencia.',
    h1: 'Diseño web profesional en Córdoba',
    intro:
      'Córdoba tiene una economía con sello propio: la joyería y la platería que la han hecho referente, el agroalimentario y el aceite de la campiña, y un turismo patrimonial que atrae visitantes de todo el mundo a la Mezquita y el casco histórico. Son sectores donde la imagen y la artesanía pesan mucho. Diseñamos webs cuidadas que hacen justicia a tu producto, en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Joyería y platería', gancho: 'Talleres y marcas del sector joyero que necesitan una web tan cuidada como sus piezas.' },
      { nombre: 'Agroalimentario y aceite', gancho: 'Almazaras y marcas que cuentan origen, denominación y calidad para vender dentro y fuera.' },
      { nombre: 'Turismo y hostelería', gancho: 'Alojamientos y restaurantes del casco histórico que necesitan reservas directas y SEO local.' },
      { nombre: 'Comercio y artesanía', gancho: 'Negocios locales que quieren visibilidad en buscadores y venta online.' },
      { nombre: 'Servicios profesionales', gancho: 'Despachos y consultoras que captan por Google.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Córdoba en remoto?', a: 'Sí. Trabajamos 100% por videollamada con clientes de Córdoba y de toda la provincia. Te ahorras el coste de una agencia con oficina y mantienes la cercanía.' },
      { q: '¿Sirve para un taller de joyería o una marca artesana?', a: 'Sí. Cuidamos especialmente la fotografía y el diseño para que las piezas luzcan, con catálogo y venta online si quieres, sin sacrificar la velocidad de carga.' },
      { q: '¿Podéis hacer la web de una almazara o marca de aceite?', a: 'Sí. Diseñamos webs que cuentan origen, denominación y proceso, con tienda online si vendes directo y versión en inglés para exportar.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para catálogos o tienda fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## Córdoba: web para una economía con sello artesano

Córdoba tiene una identidad económica difícil de copiar. Es uno de los grandes centros de **joyería y platería** de España, con talleres que exportan a todo el mundo; tiene un **agroalimentario** potente con el aceite de la campiña y la denominación de origen; y vive un **turismo patrimonial** que trae visitantes de medio planeta a la Mezquita-Catedral y al casco histórico.

Son sectores donde **la imagen, la artesanía y el origen lo son todo**. Una web descuidada le quita valor a un producto que tiene siglos de oficio detrás. Diseñamos webs que **hacen justicia a tu trabajo**: cuidadas, rápidas y pensadas para vender confianza.

## Sectores que movemos en Córdoba

### Joyería y platería
El producto joyero entra por los ojos. Cuidamos la fotografía, el ritmo visual y la carga de imágenes para que tus piezas luzcan sin que la web se vuelva lenta. Si quieres vender online, integramos catálogo y tienda.

### Agroalimentario y aceite
Una almazara o una marca de aceite venden por origen, denominación y proceso. La web cuenta esa historia y, con una tienda online, te permite vender directo dentro y fuera de España.

### Turismo y hostelería
Un alojamiento o restaurante del casco histórico vive de aparecer cuando alguien busca dónde dormir o comer en Córdoba. Trabajamos reserva directa y SEO local para ganar visibilidad sin depender solo de las plataformas.

## Qué incluimos

- Diseño a medida que cuida la imagen de tu producto.
- Velocidad y Core Web Vitals optimizados (sí, también con muchas fotos).
- SEO técnico y multilingüe si exportas.
- Catálogo, tienda o reserva según tu negocio.
- Adaptada al móvil.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en el centro de Córdoba. Somos un equipo de Extremadura, vecinos y también tierra de aceite y producto, que trabaja para toda España: reuniones por videollamada, entrega en 24-48h y precio ajustado.

Si quieres vender tus piezas o tu aceite directamente, podemos sumar una [tienda online](/tienda/online), o automatizar las consultas con un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'valladolid',
    title: 'Diseño web en Valladolid · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Valladolid: automoción, agroalimentario, vino e industria. Webs rápidas, B2B y sin permanencia.',
    h1: 'Diseño web profesional en Valladolid',
    intro:
      'Valladolid es uno de los grandes motores industriales de Castilla y León: la automoción de Renault e Iveco y su industria auxiliar, un agroalimentario fuerte y la cercanía de los vinos de Ribera del Duero, Rueda y Cigales. Es una economía B2B y de marca de producto, donde la web tiene que transmitir seriedad o vender bien una denominación. La diseñamos en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Automoción e industria auxiliar', gancho: 'Proveedores del entorno de Renault e Iveco que venden B2B y necesitan transmitir capacidad técnica.' },
      { nombre: 'Vino y bodegas', gancho: 'Bodegas de Ribera, Rueda y Cigales que venden marca, enoturismo y club de vino.' },
      { nombre: 'Agroalimentario', gancho: 'Marcas y cooperativas de Castilla que cuentan origen y calidad.' },
      { nombre: 'Industria y servicios técnicos', gancho: 'Empresas que captan clientes con catálogo y capacidades claras.' },
      { nombre: 'Comercio y servicios profesionales', gancho: 'Negocios y despachos que quieren visibilidad en las búsquedas locales.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Valladolid en remoto?', a: 'Sí. Trabajamos 100% por videollamada con clientes de Valladolid y de toda Castilla y León. Te ahorras el coste de una agencia con oficina y mantienes la cercanía.' },
      { q: '¿Sirve para un proveedor de automoción B2B?', a: 'Sí. Diseñamos webs que transmiten capacidad técnica y solvencia, con capacidades productivas, certificaciones y un contacto claro para captar clientes industriales.' },
      { q: '¿Podéis hacer la web de una bodega con enoturismo y venta?', a: 'Sí. Combinamos imagen de marca, reserva de visitas de enoturismo y tienda online o club de vino para vender directo dentro y fuera de España.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para tienda o catálogos amplios fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## Valladolid: web para industria y marca de producto

Valladolid es uno de los pilares industriales del noroeste peninsular. La **automoción** marca el ritmo, con las plantas de Renault e Iveco y una densa industria auxiliar que vende a fabricantes de toda Europa. A su alrededor, un **agroalimentario** sólido y la proximidad de algunas de las mejores denominaciones de vino de España: **Ribera del Duero, Rueda y Cigales**.

Son dos lógicas distintas pero complementarias. La industria necesita una web que **transmita capacidad técnica y solvencia B2B**. La bodega o la marca de producto necesita una web que **venda origen, marca y experiencia**. Sabemos hacer ambas.

## Sectores que movemos en Valladolid

### Automoción e industria auxiliar
Los proveedores del entorno de Renault e Iveco trabajan con exigencias de calidad altas. Diseñamos webs que comunican capacidades productivas, procesos y certificaciones de forma ordenada y creíble, con un contacto que invite a pedir presupuesto.

### Vino y bodegas
Una bodega de Ribera o Rueda vende mucho más que botellas: vende marca, paisaje y experiencia. Combinamos una web de imagen cuidada con reserva de enoturismo y tienda online o club de vino para vender directo al consumidor, dentro y fuera de España.

### Agroalimentario
Marcas y cooperativas de Castilla que necesitan contar origen y calidad para abrir mercado en distribución y tiendas especializadas.

## Qué incluimos

- Diseño a medida, industrial o de marca según tu caso.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico, datos estructurados y multilingüe si exportas.
- Catálogo B2B, reserva de enoturismo o tienda online según tu negocio.
- Adaptada al móvil.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en el centro de Valladolid. Somos un equipo de Extremadura que trabaja para toda España: reuniones por videollamada, entrega en 24-48h y precio ajustado.

Si quieres vender tu vino o tu producto directamente o automatizar reservas y consultas, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'vigo',
    title: 'Diseño web en Vigo · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Vigo: pesca, conserva, naval y automoción. Webs rápidas, B2B, multilingües y sin permanencia.',
    h1: 'Diseño web profesional en Vigo',
    intro:
      'Vigo es la ciudad más industrial de Galicia: el mayor puerto pesquero, la conserva, el sector naval con sus astilleros y una potente automoción alrededor de la planta de Stellantis. Es una economía exportadora y B2B, muy ligada al mar y a la fabricación, donde la web tiene que hablar el idioma del cliente internacional. La diseñamos en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Pesca y producto del mar', gancho: 'Empresas pesqueras y comercializadoras que venden a mercados de toda Europa.' },
      { nombre: 'Conserva y transformados', gancho: 'Marcas de conserva que cuentan origen, calidad y proceso a distribuidores y consumidor.' },
      { nombre: 'Naval y astilleros', gancho: 'Astilleros e industria auxiliar que venden ingeniería y necesitan transmitir capacidad técnica.' },
      { nombre: 'Automoción e industria auxiliar', gancho: 'Proveedores del entorno de Stellantis que captan clientes B2B internacionales.' },
      { nombre: 'Comercio y servicios', gancho: 'Negocios de la ciudad que quieren aparecer en las búsquedas locales.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Vigo en remoto?', a: 'Sí. Trabajamos 100% por videollamada con clientes de Vigo y de toda Galicia. Te ahorras el coste de una agencia con oficina y mantienes la cercanía.' },
      { q: '¿Sirve para una empresa pesquera o conservera exportadora?', a: 'Sí. Diseñamos webs multilingües que transmiten calidad, certificaciones y trazabilidad, con catálogo de producto y contacto claro para compradores internacionales.' },
      { q: '¿Podéis hacer la web en gallego, castellano e inglés?', a: 'Sí. Preparamos webs multilingües bien estructuradas para SEO con hreflang, habituales en empresas viguesas con mercado exterior.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para catálogos técnicos fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## Vigo: web para la ciudad industrial de Galicia

Vigo es el músculo industrial gallego. Aquí está el **mayor puerto pesquero**, una industria **conservera** con marcas conocidas en toda España, el **sector naval** con sus astilleros e ingeniería, y una **automoción** potentísima alrededor de la planta de Stellantis y su densa red de proveedores. Es una economía profundamente **exportadora y B2B**, vinculada al mar y a la fabricación.

El cliente de estas empresas suele estar **fuera de España y comparar proveedores online**. Si tu web es lenta, no está traducida o no transmite capacidad, pierdes oportunidades antes de la primera llamada. Diseñamos webs que **hablan el idioma del comprador internacional** y transmiten solvencia.

## Sectores que movemos en Vigo

### Pesca y producto del mar
Empresas pesqueras y comercializadoras que venden a mercados de toda Europa. La web comunica capacidad, trazabilidad y certificaciones, claves para un comprador exigente.

### Conserva y transformados
Las marcas conserveras gallegas compiten en lineales de medio mundo. La web cuenta la historia de marca y el proceso, y con una tienda online permite vender directo al consumidor.

### Naval, astilleros y automoción
Astilleros, ingeniería y proveedores de automoción se contratan por capacidad técnica. Trabajamos webs con capacidades, proyectos de referencia y certificaciones bien presentados, con un contacto comercial claro.

## Qué incluimos

- Diseño a medida con identidad industrial o de marca.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico y multilingüe con hreflang.
- Catálogo, capacidades y trazabilidad bien estructurados.
- Adaptada al móvil y a la tablet del comprador profesional.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en el centro de Vigo. Somos un equipo de Extremadura que trabaja para toda España: reuniones por videollamada, entrega en 24-48h y precio ajustado. Para una empresa viguesa exportadora, eso es una web a la altura de su producto sin pagar de más.

Si quieres vender tu producto del mar directamente o automatizar el contacto internacional, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'granada',
    title: 'Diseño web en Granada · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de Granada: turismo, universidad, tecnología y salud del PTS. Webs rápidas, multilingües y sin permanencia.',
    h1: 'Diseño web profesional en Granada',
    intro:
      'Granada vive del turismo de la Alhambra y el casco histórico, de una de las universidades más grandes de España que llena la ciudad de estudiantes, y de un creciente polo de tecnología y salud en torno al Parque Tecnológico de la Salud (PTS). Es una economía donde conviven la hostelería, el conocimiento y la innovación. Diseñamos webs rápidas y multilingües que conectan con cada público, en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Turismo y hostelería', gancho: 'Alojamientos y restaurantes del entorno de la Alhambra que necesitan reservas directas y SEO local.' },
      { nombre: 'Tecnología y salud (PTS)', gancho: 'Empresas biotech, salud y tecnología que necesitan webs serias y medibles.' },
      { nombre: 'Universidad y formación', gancho: 'Academias, centros y servicios para estudiantes que captan matrícula por Google.' },
      { nombre: 'Comercio y artesanía', gancho: 'Negocios locales que quieren visibilidad en buscadores y venta online.' },
      { nombre: 'Servicios profesionales', gancho: 'Despachos y clínicas que captan por Google.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Granada en remoto?', a: 'Sí. Trabajamos 100% por videollamada con clientes de Granada y de toda la provincia. Te ahorras el coste de una agencia con oficina y mantienes la cercanía.' },
      { q: '¿Hacéis webs multilingües para el turismo de la Alhambra?', a: 'Sí. Para un público tan internacional preparamos webs en inglés y otros idiomas, con reserva directa y bien estructuradas para SEO con hreflang.' },
      { q: '¿Sirve para una empresa del PTS o de salud?', a: 'Sí. Diseñamos webs serias y medibles, con la información técnica y de confianza que necesita un sector tan exigente como el sanitario y biotech.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para proyectos con varios idiomas fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## Granada: turismo, universidad y conocimiento

Granada tiene una mezcla económica peculiar y muy potente. El **turismo** de la Alhambra y el Albaicín atrae visitantes de todo el mundo durante todo el año. La **Universidad de Granada**, una de las mayores de España, llena la ciudad de estudiantes y genera servicios a su alrededor. Y un polo creciente de **tecnología y salud** en torno al Parque Tecnológico de la Salud (PTS) sitúa a la ciudad en el mapa de la innovación biomédica.

Cada uno de esos públicos llega de una manera distinta: el turista, en otro idioma y desde el móvil; el estudiante, buscando en Google; la empresa, comparando proveedores serios. Diseñamos webs **rápidas y adaptadas a cada caso**, sin plantillas genéricas.

## Sectores que movemos en Granada

### Turismo y hostelería
Un alojamiento o restaurante junto a la Alhambra vive de aparecer cuando alguien busca dónde dormir o comer en Granada, muchas veces en inglés. Trabajamos reserva directa y SEO local para reducir comisiones y ganar visibilidad.

### Tecnología y salud del PTS
Las empresas biotech, sanitarias y tecnológicas del PTS necesitan webs que transmitan rigor y confianza, con la información técnica bien presentada y medición desde el primer día.

### Universidad y formación
Academias, centros de idiomas y servicios para estudiantes captan matrícula por Google. Optimizamos para esas búsquedas y para que el contacto o la inscripción sean fáciles.

## Qué incluimos

- Diseño a medida con tu identidad.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico y multilingüe con hreflang para el turismo.
- Reserva directa, formularios de inscripción o web técnica según tu negocio.
- Adaptada al móvil.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en el centro de Granada. Somos un equipo de Extremadura que trabaja para toda España: reuniones por videollamada, entrega en 24-48h y precio ajustado.

Si quieres vender online o automatizar reservas, matrículas y consultas, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia) que atienda en varios idiomas.`,
  },
  {
    service: 'diseno-web',
    citySlug: 'a-coruna',
    title: 'Diseño web en A Coruña · 24-48h | Latech',
    description:
      'Diseño web profesional para empresas de A Coruña: textil y moda, pesca, banca y comercio. Webs rápidas, cuidadas y sin permanencia.',
    h1: 'Diseño web profesional en A Coruña',
    intro:
      'A Coruña es la ciudad del textil y la moda por excelencia (Inditex y todo su ecosistema de proveedores nació aquí), con un puerto pesquero importante, sector servicios, banca y seguros, y un comercio muy activo. Es una economía con cultura de marca y de imagen cuidada, donde una web mediocre desentona. Diseñamos webs rápidas y bien diseñadas, en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Textil, moda y complementos', gancho: 'Marcas, talleres y proveedores del ecosistema textil que necesitan una web a la altura de su producto.' },
      { nombre: 'Pesca y producto del mar', gancho: 'Empresas del puerto que venden a distribución y mercados de toda Europa.' },
      { nombre: 'Servicios, banca y seguros', gancho: 'Despachos, consultoras y servicios financieros que necesitan autoridad y confianza.' },
      { nombre: 'Comercio y hostelería', gancho: 'Negocios de la ciudad que quieren visibilidad en las búsquedas locales y venta online.' },
      { nombre: 'Tecnología y creatividad', gancho: 'Estudios y empresas tech que necesitan landings rápidas que conviertan.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de A Coruña en remoto?', a: 'Sí. Trabajamos 100% por videollamada con clientes de A Coruña y de toda Galicia. Te ahorras el coste de una agencia con oficina y mantienes la cercanía.' },
      { q: '¿Sirve para una marca de moda o un proveedor textil?', a: 'Sí. Cuidamos especialmente la imagen, la fotografía y el ritmo visual para que tu marca luzca, con catálogo o tienda online y sin sacrificar la velocidad de carga.' },
      { q: '¿Podéis hacer la web en gallego, castellano e inglés?', a: 'Sí. Preparamos webs multilingües bien estructuradas para SEO con hreflang, útiles si vendes o exportas fuera de Galicia.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para tienda o catálogos amplios fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## A Coruña: web para una ciudad con cultura de marca

A Coruña es difícil de entender sin la moda. Aquí nació y crece el mayor ecosistema **textil** de España, con su red de proveedores, talleres y servicios alrededor. A eso se suma un **puerto pesquero** relevante, un sector de **servicios, banca y seguros**, y un comercio urbano muy activo. Es una ciudad con **cultura de imagen y de marca**: aquí se sabe que el diseño vende.

Por eso una web mediocre desentona especialmente en A Coruña. El listón visual es alto y el cliente lo nota. Diseñamos webs **rápidas y bien diseñadas**, que transmiten el cuidado que tu negocio pone en su producto.

## Sectores que movemos en A Coruña

### Textil, moda y complementos
Marcas, talleres y proveedores del ecosistema textil necesitan una web que esté a la altura de su producto. Cuidamos fotografía, tipografía y ritmo visual, con catálogo o tienda online, sin que la web se vuelva lenta por las imágenes.

### Pesca y producto del mar
Las empresas del puerto venden a distribución y mercados europeos. La web comunica calidad, trazabilidad y capacidad, claves para un comprador profesional.

### Servicios, banca y seguros
Despachos, consultoras y servicios financieros se contratan por confianza. Una web seria, clara y con casos o servicios bien explicados convierte visitas en contactos cualificados.

## Qué incluimos

- Diseño a medida con identidad cuidada.
- Velocidad y Core Web Vitals optimizados, también con mucha imagen.
- SEO técnico y multilingüe con hreflang si vendes fuera.
- Catálogo, tienda online o web de servicios según tu negocio.
- Adaptada al móvil.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de trabajar en remoto

No pagas la estructura de una agencia con oficina en el centro de A Coruña. Somos un equipo de Extremadura que trabaja para toda España: reuniones por videollamada, entrega en 24-48h y precio ajustado, con un nivel de diseño a la altura de una ciudad acostumbrada a la buena imagen.

Si quieres vender online o automatizar la atención al cliente, podemos sumar una [tienda online](/tienda/online) o un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'badajoz',
    title: 'Diseño web en Badajoz desde 600 € | Latech',
    description:
      'Diseño web en Badajoz desde 600 €, entrega en 24-48 h y sin permanencia. Equipo extremeño para empresas, comercios y profesionales.',
    h1: 'Diseño web profesional en Badajoz',
    updatedAt: '2026-07-22',
    intro:
      'Badajoz es nuestra tierra. Conocemos de primera mano su economía: el agroalimentario y el ibérico de la dehesa, la ganadería, la logística que aprovecha la frontera con Portugal y el auge de la energía solar. Es una provincia con producto excelente que muchas veces no se vende bien por internet. Diseñamos webs que ponen en valor lo que hacéis, en remoto, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Agroalimentario e ibérico', gancho: 'Productores de la dehesa, ibérico, quesos y aceite que necesitan vender origen y calidad dentro y fuera.' },
      { nombre: 'Ganadería y dehesa', gancho: 'Explotaciones y marcas que cuentan su producto y su trazabilidad a distribuidores y consumidor.' },
      { nombre: 'Logística y comercio con Portugal', gancho: 'Empresas que aprovechan la frontera y necesitan web bilingüe y seria para clientes de ambos lados.' },
      { nombre: 'Energía solar y servicios', gancho: 'Instaladoras y empresas del sector renovable en plena expansión que captan clientes por Google.' },
      { nombre: 'Comercio y hostelería', gancho: 'Negocios locales que quieren visibilidad en las búsquedas de la ciudad y la provincia.' },
    ],
    faq: [
      { q: '¿Trabajáis con empresas de Badajoz?', a: 'Sí, y muy de cerca. Somos un equipo de Extremadura: conocemos la provincia, su economía y su producto. Trabajamos por videollamada con la cercanía de quien es de la tierra, con entrega en 24-48h.' },
      { q: '¿Sirve para un productor de ibérico, queso o aceite?', a: 'Sí. Diseñamos webs que cuentan origen, dehesa y proceso, con tienda online para vender directo y versión en inglés o portugués si exportas.' },
      { q: '¿Podéis hacer la web bilingüe español-portugués?', a: 'Sí. Para empresas que trabajan con Portugal preparamos webs bilingües bien estructuradas para SEO con hreflang.' },
      { q: '¿Sirve para una instaladora de energía solar?', a: 'Sí. El sector está en plena expansión en Extremadura. Diseñamos webs que captan solicitudes de presupuesto con SEO local y formularios claros.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para tienda online fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## ¿Cuánto cuesta una página web en Badajoz?

Una web profesional para una empresa de Badajoz cuesta **600 € de creación más 60 €/mes** con Latech: hosting, SEO técnico y mantenimiento incluidos, sin permanencia y con entrega en 24-48 h. Somos un equipo extremeño, así que trabajas cerca, sin desplazamientos ni intermediarios.

| Servicio | Precio | Entrega |
| --- | --- | --- |
| Página web | 600 € + 60 €/mes | 24-48 h |
| Tienda online | 600 € + 80 €/mes | 48-72 h |
| Agente de IA | Desde 150 €/mes | 3-5 días |

## Badajoz: nuestra tierra, nuestro producto

Badajoz no es una ciudad más en este listado: **es nuestra tierra**. Conocemos su economía sin necesidad de que nadie nos la explique. El **agroalimentario y el ibérico de la dehesa**, los quesos y el aceite, la **ganadería**, la **logística** que aprovecha la frontera con Portugal y el espectacular auge de la **energía solar** en la provincia.

Lo decimos con cariño y con conocimiento de causa: Extremadura tiene un producto excelente que, demasiadas veces, **no se vende bien por internet**. Webs lentas, anticuadas o inexistentes dejan escapar a un consumidor y a un distribuidor que hoy buscan y compran online. Eso es justo lo que arreglamos.

## Sectores que movemos en Badajoz

### Agroalimentario e ibérico
Un productor de ibérico, queso o aceite de la dehesa tiene una historia que vale oro: origen, tradición y calidad. Diseñamos webs que cuentan esa historia y, con una **tienda online**, te permiten vender directo al consumidor de toda España sin intermediarios que se queden el margen.

### Logística y comercio con Portugal
La cercanía con Portugal es una ventaja que muchas empresas pacenses aprovechan. Preparamos webs **bilingües español-portugués** para que tus clientes de ambos lados de la frontera te entiendan y confíen.

### Energía solar y renovables
Extremadura es una de las grandes apuestas solares de España. Para instaladoras y empresas del sector, una web con SEO local y formularios de presupuesto claros es una fuente constante de clientes.

## Qué incluimos

- Diseño a medida que pone en valor tu producto.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico, local y bilingüe español-portugués si trabajas con Portugal.
- Tienda online, catálogo o captación de presupuestos según tu negocio.
- Adaptada al móvil.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu caso sin compromiso.

## La ventaja de ser de aquí y trabajar en remoto

No necesitamos una oficina cara para estar cerca de ti: **somos de Extremadura**. Trabajamos por videollamada con la cercanía de quien conoce la provincia, con entrega en 24-48h y sin permanencia. Para una empresa de Badajoz, eso es tener al lado a un equipo que entiende su producto y su mercado.

Si quieres vender tu ibérico, tu queso o tu aceite directamente, podemos sumar una [tienda online](/tienda/online), o automatizar pedidos y consultas con un [agente de IA](/tienda/agente-ia).`,
  },
  {
    service: 'diseno-web',
    citySlug: 'merida',
    title: 'Diseño web en Mérida · 24-48h | Latech',
    description:
      'Diseño y desarrollo web para empresas de Mérida: servicios y administración, turismo y patrimonio, hostelería y agroalimentario. Webs y apps rápidas, sin permanencia.',
    h1: 'Diseño y desarrollo web en Mérida',
    intro:
      'Mérida es la capital de Extremadura y la tenemos al lado: nuestro equipo trabaja a quince minutos, en Puebla de la Calzada. Conocemos su tejido: la administración y los servicios que giran alrededor de la Junta, el turismo y la hostelería que viven del mayor conjunto romano de España, el comercio del centro y el agroalimentario de la Vega del Guadiana. Diseñamos y desarrollamos webs y aplicaciones a medida que convierten ese movimiento en clientes, con entrega en 24-48h y sin permanencia.',
    sectores: [
      { nombre: 'Servicios, gestorías y consultoría', gancho: 'Despachos, asesorías y empresas de servicios que orbitan la capital autonómica y captan clientes por Google.' },
      { nombre: 'Turismo, cultura y patrimonio', gancho: 'Alojamientos, visitas guiadas, restauración y comercio que viven del Teatro Romano y el Festival de Mérida.' },
      { nombre: 'Hostelería y comercio del centro', gancho: 'Bares, restaurantes y tiendas que necesitan reservas, carta digital y visibilidad local en la ciudad.' },
      { nombre: 'Agroalimentario de la Vega', gancho: 'Productores y cooperativas de la Vega del Guadiana que quieren vender origen y calidad dentro y fuera.' },
      { nombre: 'Administración y empresas tecnológicas', gancho: 'Proyectos que necesitan desarrollo web a medida, apps y automatización con IA conectada a sus sistemas.' },
    ],
    faq: [
      { q: '¿Estáis cerca de Mérida?', a: 'Muchísimo. Somos un equipo de Extremadura, en Puebla de la Calzada, a unos quince minutos de Mérida. Trabajamos por videollamada con la cercanía de quien es de aquí, con entrega en 24-48h.' },
      { q: '¿Hacéis solo diseño web o también desarrollo a medida y apps?', a: 'Las dos cosas. Además de diseño web, programamos aplicaciones y desarrollo a medida desde cero, y agentes de IA conectados a tus sistemas. No usamos plantillas.' },
      { q: '¿Sirve para un negocio de turismo o restauración de Mérida?', a: 'Sí. Diseñamos webs con reservas, carta digital y SEO local para que te encuentren los visitantes del Teatro Romano y del Festival de Mérida, y los vecinos de la ciudad.' },
      { q: '¿Podéis integrar reservas, pagos o citas online?', a: 'Sí. Integramos reservas, pagos con Stripe o Bizum, citas y formularios avanzados según lo que necesite tu negocio.' },
      { q: '¿Cuánto tardáis?', a: 'La mayoría de webs en 24-48h una vez tenemos tus contenidos. Para tienda online o desarrollo a medida fijamos calendario.' },
      { q: '¿Hay permanencia?', a: 'No. La web es tuya, sin permanencia. Mantenimiento opcional.' },
    ],
    bodyMarkdown: `## ¿Cuánto cuesta una página web en Mérida?

Una web profesional para una empresa de Mérida cuesta **600 € de creación más 60 €/mes** con Latech, con hosting, SEO técnico y mantenimiento incluidos, sin permanencia y entregada en 24-48 h. Estamos a quince minutos, en Puebla de la Calzada, así que trabajas con un equipo cercano y sin intermediarios.

| Servicio | Precio | Entrega |
| --- | --- | --- |
| Página web | 600 € + 60 €/mes | 24-48 h |
| Tienda online | 600 € + 80 €/mes | 48-72 h |
| Agente de IA | Desde 150 €/mes | 3-5 días |

## Mérida: la capital de Extremadura, a quince minutos de nosotros

Mérida no nos queda lejos: **la tenemos al lado**. Nuestro equipo trabaja desde Puebla de la Calzada, a un cuarto de hora. Conocemos su ritmo sin que nadie nos lo explique: la **administración y los servicios** que giran en torno a la Junta de Extremadura, el **turismo y la hostelería** que viven del mayor conjunto arqueológico romano de España, el comercio del centro y el **agroalimentario de la Vega del Guadiana**.

Es una ciudad con mucho movimiento que, demasiadas veces, no lo aprovecha bien en internet. Ahí es donde entramos: diseñamos y **desarrollamos webs y aplicaciones a medida** que convierten ese movimiento en clientes.

## Sectores que movemos en Mérida

### Servicios, gestorías y consultoría
Al ser capital autonómica, Mérida concentra despachos, asesorías y empresas de servicios. Para ellos, una web seria, rápida y bien posicionada en Google es la mejor tarjeta de presentación y una fuente constante de contactos.

### Turismo, cultura y hostelería
El Teatro Romano y el Festival de Mérida traen visitantes todo el año. Diseñamos webs con **reservas, carta digital y SEO local** para que alojamientos, restaurantes, guías y comercios capten a ese turista y también al vecino de la ciudad.

### Desarrollo a medida y apps
Cuando un proyecto necesita más que una web, lo programamos: **desarrollo web a medida**, aplicaciones y **agentes de IA** conectados a tus sistemas. Sin plantillas, sin atajos.

## Qué incluimos

- Diseño y desarrollo a medida, sin plantillas.
- Velocidad y Core Web Vitals optimizados.
- SEO técnico y local para aparecer en las búsquedas de Mérida y Extremadura.
- Reservas, pagos (Stripe, Bizum), citas o catálogo según tu negocio.
- Adaptada al móvil.

Consulta planes y precios en [diseño web](/tienda/web) o cuéntanos tu proyecto sin compromiso.

## La ventaja de tenernos al lado y trabajar en remoto

No hace falta una oficina cara para estar cerca de ti: **estamos a quince minutos de Mérida**. Trabajamos por videollamada con la cercanía de quien conoce la ciudad y la región, con entrega en 24-48h y sin permanencia. Para una empresa de Mérida, eso es tener a mano a un equipo que entiende su mercado.

Si además quieres vender online, podemos sumar una [tienda online](/tienda/online), o automatizar reservas, citas y consultas con un [agente de IA](/tienda/agente-ia).`,
  },
];
