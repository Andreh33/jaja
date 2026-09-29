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
      { q: '¿Hay permanencia o cuotas obligatorias?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
    title: 'Diseño web en Barcelona desde 800 € | Latech',
    description:
      'Webs a medida para empresas de Barcelona: 800 € + 60 €/mes, IVA no incluido. SEO técnico, trabajo en remoto y sin permanencia.',
    h1: 'Diseño web a medida para empresas de Barcelona',
    updatedAt: '2026-09-29',
    intro:
      'Una reserva, una consulta o una visita al catálogo: cada negocio necesita un recorrido distinto. Diseñamos webs para empresas de Barcelona que quieren explicar bien su oferta y facilitar el siguiente paso. Trabajamos en remoto desde Puebla de la Calzada, con reuniones por videollamada, una propuesta de alcance y revisión contigo antes de publicar.',
    sectores: [
      { nombre: 'Restaurantes y alojamientos', gancho: 'Carta, ubicación, horarios y acceso a reservas fáciles de encontrar desde el móvil.' },
      { nombre: 'Estudios y profesionales creativos', gancho: 'Portfolio con contexto: qué haces, para quién y cómo solicitar una propuesta.' },
      { nombre: 'Comercio y marcas', gancho: 'Productos y servicios bien organizados; venta online cuando el proyecto necesita carrito y pagos.' },
      { nombre: 'Empresas de servicios', gancho: 'Páginas por servicio y formularios que recojan la información necesaria para responder.' },
      { nombre: 'Negocios con varios idiomas', gancho: 'Versiones en catalán, castellano o inglés según el público y los contenidos disponibles.' },
    ],
    faq: [
      { q: '¿Tenéis oficina en Barcelona?', a: 'Nuestra sede está en Calle Puente 3, Puebla de la Calzada, Badajoz. Los proyectos de Barcelona los trabajamos en remoto: videollamadas, contenidos compartidos y revisión de la web antes de publicarla.' },
      { q: '¿Cuánto cuesta una web y qué se paga cada mes?', a: 'El plan web parte de 800 € de creación más 60 €/mes de hosting y mantenimiento, IVA no incluido y sin permanencia. Idiomas, reservas, tienda y otras funciones se revisan y presupuestan según el alcance; no se añaden sin acordarlo.' },
      { q: '¿Podéis preparar la web en catalán, castellano e inglés?', a: 'Sí. Acordamos qué idiomas necesita tu público, qué páginas se traducen y quién aporta y revisa los textos. Preparamos la navegación y las etiquetas hreflang para relacionar las versiones. El alcance multilingüe queda incluido en la propuesta.' },
      { q: '¿Cuánto tarda el proyecto?', a: 'La referencia para una web sencilla es de 24-48 horas desde que recibimos los contenidos completos y acordamos el alcance. Si hay varios idiomas, un catálogo amplio o integraciones, fijamos un calendario específico antes de empezar.' },
      { q: '¿Incluye SEO para búsquedas en Barcelona?', a: 'Incluye la base técnica: títulos, descripciones, estructura de páginas, sitemap y datos estructurados cuando correspondan. Revisamos cómo explicar tus servicios y tu zona de atención. No garantizamos posiciones; los resultados también dependen del contenido, la competencia y el trabajo continuado.' },
    ],
    bodyMarkdown: `## Diseño web en Barcelona: precio y alcance

La referencia del [plan de diseño web](/tienda/web) es **800 € de creación más 60 €/mes de hosting y mantenimiento, IVA no incluido y sin permanencia**. Incluye una web adaptada al móvil, SEO técnico y los cambios menores previstos en el plan. Antes de empezar dejamos por escrito las páginas, los materiales y las funciones que tendrá tu proyecto.

Puedes usar la [calculadora de presupuesto](/tienda/calculadora) para separar creación, cuota mensual y complementos. Si necesitas varios idiomas, reservas o venta online, revisamos esas opciones contigo para confirmar qué incluyen y cuánto cuestan.

## Una web que ayude a reservar, comparar o contactar

Para un restaurante de Barcelona, el recorrido puede empezar por consultar la carta en el móvil y terminar en una reserva. Para un estudio creativo, suele importar ver trabajos, entender tu especialidad y pedir una propuesta. Definir esa acción antes de diseñar ayuda a decidir qué información debe aparecer primero.

Si atiendes en catalán, castellano e inglés, acordamos qué contenido necesita cada público. Una versión multilingüe requiere textos revisados, navegación entre idiomas y datos de contacto coherentes. No basta con traducir el menú y dejar el resto a medias.

## Qué preparar antes de encargar la web

- Servicios o productos que quieres presentar y la acción principal que esperas del visitante.
- Logo, fotografías con permiso de uso y ejemplos del tono de tu marca.
- Horarios, dirección y zona de atención reales, si recibes clientes o te desplazas.
- Idiomas necesarios y responsable de revisar cada traducción.
- Sistema de reservas, catálogo o herramienta que haya que conectar, si existe.

El [briefing de tu proyecto](/briefing) permite ordenar esta información y exportarla antes de compartirla. Así podemos revisar una necesidad concreta y evitar que un idioma o una integración aparezca cuando la web ya está terminada.

## Cómo trabajamos contigo desde Barcelona

Nuestra sede está en **Puebla de la Calzada, Badajoz**. Colaboramos en remoto: revisamos el briefing, acordamos contenido y dirección, y comprobamos contigo la web antes de publicar. En una web sencilla, la referencia es de 24-48 horas desde que contamos con los materiales completos; el plazo de un proyecto más amplio se define en la propuesta.

Antes de decidir, recorre los [proyectos de Latech](/proyectos) desde tu móvil. Fíjate en la navegación, en cómo se presentan los servicios y en lo fácil que resulta encontrar el contacto. Encontrarás ejemplos de nuestro trabajo con negocios de distintos sectores.`,
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
    title: 'Diseño web en Bilbao desde 800 € | Latech',
    description:
      'Web a medida para tu empresa en Bilbao: 800 € + 60 €/mes, IVA no incluido. Trabajo en remoto, SEO técnico y sin permanencia.',
    h1: 'Diseño web a medida para empresas de Bilbao',
    updatedAt: '2026-09-29',
    intro:
      'Si buscas un diseñador web para tu empresa en Bilbao, empezamos por lo que necesita saber tu cliente: qué servicios prestas, qué capacidad tienes y cómo pedirte presupuesto. Construimos webs para presentar esa información con claridad. Somos un equipo de Puebla de la Calzada, Badajoz, y trabajamos con Bilbao y Bizkaia en remoto por videollamada.',
    sectores: [
      { nombre: 'Ingeniería y servicios técnicos', gancho: 'Especialidades, proceso de trabajo y documentación que ayuden al cliente a valorar tu propuesta.' },
      { nombre: 'Fabricantes y proveedores B2B', gancho: 'Catálogo, capacidades y fichas organizadas para facilitar una consulta comercial concreta.' },
      { nombre: 'Consultorías y despachos', gancho: 'Servicios, equipo y forma de trabajar explicados antes de solicitar una reunión.' },
      { nombre: 'Comercio y hostelería', gancho: 'Información práctica para encontrar el negocio, consultar su oferta y contactar desde el móvil.' },
      { nombre: 'Empresas con clientes internacionales', gancho: 'Contenido en euskera, castellano o inglés según los mercados y los materiales del proyecto.' },
    ],
    faq: [
      { q: '¿Sois un estudio de diseño web con oficina en Bilbao?', a: 'Nuestra sede está en Puebla de la Calzada, Badajoz. Prestamos el servicio para Bilbao y Bizkaia en remoto, con reuniones por videollamada y revisión del proyecto contigo. Puedes conocer al equipo y ver nuestro portfolio antes de contratar.' },
      { q: '¿Cuál es el precio de una página web?', a: 'El plan web parte de 800 € de creación y 60 €/mes de hosting y mantenimiento, IVA no incluido y sin permanencia. Un catálogo técnico, varios idiomas o integraciones pueden ampliar el alcance y se presupuestan antes de comenzar.' },
      { q: '¿Podéis diseñar una web para una empresa industrial o B2B?', a: 'Sí. Organizamos los servicios, capacidades, fichas y vías de contacto a partir de la información de tu empresa. Los proyectos, resultados y certificaciones publicados deben ser reales y estar aprobados por ti. Si necesitas buscador, descargas o un catálogo amplio, lo detallamos en la propuesta.' },
      { q: '¿La web puede estar en euskera, castellano e inglés?', a: 'Sí. Definimos los idiomas y las páginas que necesita cada versión, y acordamos quién aporta y valida las traducciones. Preparamos navegación y etiquetas hreflang; el presupuesto recoge el alcance de ese trabajo.' },
      { q: '¿En cuánto tiempo se entrega y qué SEO incluye?', a: 'Para una web sencilla, la referencia es de 24-48 horas desde que están completos los materiales y acordado el alcance. Los proyectos más amplios tienen su propio calendario. Incluimos SEO técnico y una estructura comprensible para buscadores, sin prometer posiciones ni un volumen de contactos.' },
    ],
    bodyMarkdown: `## Cuánto cuesta una web para tu empresa en Bilbao

El [plan web de Latech](/tienda/web) parte de **800 € de creación más 60 €/mes de hosting y mantenimiento, IVA no incluido y sin permanencia**. Una web corporativa y un catálogo con cientos de referencias requieren trabajos distintos: antes de contratar concretamos páginas, contenido, idiomas y funciones.

La [calculadora de presupuesto](/tienda/calculadora) permite consultar la creación, la cuota y los complementos por separado. Para una web técnica, también necesitamos conocer cómo están organizadas las fichas y si deben conectarse con alguna herramienta de la empresa.

## Lo que necesita ver un comprador antes de pedir presupuesto

En un proyecto industrial o de servicios B2B, una fotografía de la instalación aporta contexto, pero no explica por sí sola qué puedes resolver. Conviene ordenar la información para que quien compara proveedores encuentre:

- Qué servicios, materiales o procesos ofreces y qué queda fuera de tu actividad.
- Capacidades y especificaciones con datos que tu equipo haya validado.
- Fichas, certificaciones vigentes y ejemplos de trabajo que puedas publicar.
- Zona de servicio y forma de enviar los requisitos de una consulta.

Diseñamos ese recorrido para que se pueda leer desde el móvil y para que el contacto tenga contexto. Un formulario puede pedir servicio, ubicación y una descripción de la necesidad; los campos y cualquier documentación adicional se acuerdan según tu proceso comercial.

## Cómo preparar el contenido sin retrasar el proyecto

Reúne las fichas actualizadas y elige a la persona que revisará los términos técnicos. Si habrá versiones en euskera o inglés, decide qué páginas necesitan traducción y quién comprobará los textos. También conviene identificar qué documentación es pública y qué información no debe publicarse.

Puedes organizarlo en el [briefing](/briefing). Primero revisamos esos materiales, después acordamos la estructura y finalmente comprobamos contenido, navegación y vías de contacto antes de publicar. Las 24-48 horas son la referencia para una web sencilla con el material completo; un catálogo o una integración se planifica aparte.

## Un equipo en remoto que puedes conocer antes de decidir

Trabajamos desde **Puebla de la Calzada, Badajoz**, con videollamadas para los proyectos de Bilbao y Bizkaia. En [sobre nosotros](/sobre-nosotros) puedes conocer al equipo; en el [portfolio](/proyectos), revisar cómo resolvemos webs de servicios, comercio y proyectos B2B.

Compara esos ejemplos con tu necesidad: claridad de la oferta, orden del catálogo y facilidad para pedir información. Si lo que buscas es vender y cobrar directamente, revisamos el alcance de una [tienda online](/tienda/online) como parte del presupuesto.`,
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
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
    title: 'Diseño web en Badajoz desde 800 € | Latech',
    description:
      'Diseño web en Badajoz: 800 € + 60 €/mes, IVA no incluido. Equipo en Puebla de la Calzada, con SEO técnico y sin permanencia.',
    h1: 'Diseño web en Badajoz con un equipo de Extremadura',
    updatedAt: '2026-09-29',
    intro:
      'Latech tiene su sede en Calle Puente 3, Puebla de la Calzada. Diseñamos webs para negocios de Badajoz y su provincia: presentar servicios, mostrar un catálogo o facilitar una solicitud de presupuesto. Podemos trabajar por videollamada o acordar una reunión presencial. Antes de empezar concretamos lo que necesitas, los materiales y el precio.',
    sectores: [
      { nombre: 'Comercio y hostelería', gancho: 'Horarios, catálogo o carta y contacto accesibles para quien consulta el negocio desde el móvil.' },
      { nombre: 'Productores y distribuidores', gancho: 'Productos, origen y documentación organizados para clientes particulares o profesionales.' },
      { nombre: 'Instaladoras y empresas de servicios', gancho: 'Servicios y zonas de atención claros para recibir solicitudes de presupuesto con contexto.' },
      { nombre: 'Despachos y profesionales', gancho: 'Especialidad, equipo y pasos para consultar o solicitar una cita.' },
      { nombre: 'Negocios que trabajan con Portugal', gancho: 'Contenido en español y portugués cuando tu actividad y tu público necesitan ambas versiones.' },
    ],
    faq: [
      { q: '¿Dónde está Latech? ¿Podemos reunirnos en persona?', a: 'Estamos en Calle Puente 3, 06490 Puebla de la Calzada, en la provincia de Badajoz. Podemos acordar una reunión presencial o trabajar por videollamada. La sede está en Puebla de la Calzada, no en Badajoz capital.' },
      { q: '¿Cuánto cuesta una página web en Badajoz?', a: 'El plan web parte de 800 € de creación más 60 €/mes de hosting y mantenimiento, IVA no incluido y sin permanencia. Acordamos páginas, contenido y funciones antes de comenzar. La tienda online, los idiomas y otras opciones se desglosan según las necesidades del proyecto.' },
      { q: '¿Puedo ver proyectos vuestros de Extremadura?', a: 'Sí. En nuestro portfolio puedes consultar Zona Sport, comercio de Puebla de la Calzada, y Panelex, proyecto del sector de la construcción en Extremadura. Puedes abrir las webs y valorar su navegación, contenido y contacto antes de decidir.' },
      { q: '¿Podéis preparar una web en español y portugués?', a: 'Sí. Revisamos qué páginas necesitan ambos idiomas y quién aporta y valida las traducciones. Acordamos el alcance multilingüe en el presupuesto y preparamos navegación y etiquetas hreflang para relacionar las versiones.' },
      { q: '¿Cuánto tarda y qué necesitáis para empezar?', a: 'La referencia para una web sencilla es de 24-48 horas desde que tenemos el contenido completo y el alcance acordado. Necesitamos los textos, imágenes, logo y datos de contacto. Los catálogos amplios, idiomas e integraciones requieren un calendario específico.' },
      { q: '¿Incluye aparecer en Google?', a: 'Preparamos la base técnica para que los buscadores entiendan la web: estructura, títulos, descripciones, sitemap y datos estructurados cuando correspondan. Trabajamos con tus servicios y zonas de atención reales. La indexación y las posiciones las decide Google; no prometemos resultados ni plazos de posicionamiento.' },
    ],
    bodyMarkdown: `## Precio de una web en Badajoz, con los conceptos separados

La referencia del [plan web](/tienda/web) es **800 € de creación más 60 €/mes de hosting y mantenimiento, IVA no incluido y sin permanencia**. El presupuesto concreta las páginas, los materiales que hay que preparar y las funciones incluidas. Los cambios menores previstos en el plan y el trabajo adicional se distinguen antes de empezar.

Si quieres vender online, añadir idiomas o conectar otras herramientas, consulta la [calculadora de presupuesto](/tienda/calculadora). Te permite ver los complementos y separar el pago inicial de la cuota mensual para revisar una propuesta con el mismo alcance.

## Nuestra sede está en Puebla de la Calzada

Estamos en **Calle Puente 3, 06490 Puebla de la Calzada, Badajoz**. Puedes conocer al [equipo de Latech](/sobre-nosotros) y acordar una reunión presencial, o trabajar por videollamada si te resulta más cómodo. Atendemos proyectos de Badajoz capital y de la provincia desde esta sede en Extremadura.

Para valorar nuestro trabajo tienes ejemplos que puedes abrir: **Zona Sport**, comercio de Puebla de la Calzada, y **Panelex**, del sector de la construcción en Extremadura, están en el [portfolio](/proyectos). Revisa cómo se presenta cada oferta y cómo se llega al contacto; el alcance de tu web se definirá según tu negocio.

## La web debe explicar qué haces y dónde atiendes

Una instaladora necesita que el visitante entienda sus servicios, la zona de trabajo y qué datos enviar para pedir presupuesto. Un comercio puede necesitar un catálogo y contacto directo; si quiere cobrar online, habrá que definir productos, pagos y entrega dentro del proyecto de tienda.

Para productores y distribuidores, organizamos la información de producto, origen y documentación que puedas acreditar. Si trabajas con Portugal, acordamos las páginas en portugués y quién revisará las traducciones. No añadimos idiomas ni funciones que no formen parte de la propuesta.

## De la idea a una web revisada contigo

Empieza por el [briefing](/briefing): qué quieres conseguir, a quién atiendes y qué materiales tienes. Nos ayuda a detectar si faltan fotografías, textos, horarios o datos necesarios antes de diseñar.

Después acordamos estructura y contenido, preparamos la web y la revisamos contigo desde escritorio y móvil. Comprobamos que servicios, contacto y navegación correspondan a lo aprobado. La referencia de 24-48 horas se aplica a webs sencillas con los materiales completos; para catálogos, varios idiomas o integraciones fijamos un calendario propio.

El SEO técnico forma parte de la base, pero no equivale a prometer posiciones. Trabajamos con información real del negocio y de su zona de atención, para que el visitante pueda decidir si tu servicio encaja con lo que necesita.`,
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
      { q: '¿Hay permanencia?', a: 'No hay permanencia. El plan incluye 800 € de creación más 60 €/mes de hosting y mantenimiento. IVA no incluido.' },
    ],
    bodyMarkdown: `## ¿Cuánto cuesta una página web en Mérida?

Una web profesional para una empresa de Mérida cuesta **800 € de creación más 60 €/mes** con Latech, con hosting, SEO técnico y mantenimiento incluidos, sin permanencia y entregada en 24-48 h. Estamos a quince minutos, en Puebla de la Calzada, así que trabajas con un equipo cercano y sin intermediarios.

| Servicio | Precio | Entrega |
| --- | --- | --- |
| Página web | 800 € + 60 €/mes | 24-48 h |
| Tienda online | 800 € + 80 €/mes | 48-72 h |
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
