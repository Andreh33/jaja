export type Project = {
  id: string;
  name: string;
  url: string;
  domain: string;
  sector: string;
  location: string;
  description: string;
  image: string;
  services?: readonly string[];
};

export const projects: Project[] = [
  {
    id: 'fulldip-sur',
    name: 'FullDip Sur',
    url: 'https://fulldip-sur.vercel.app/',
    domain: 'fulldip-sur.vercel.app',
    sector: 'Vinilo líquido, wrapping y personalización de vehículos',
    location: 'Fuenlabrada (Madrid)',
    description:
      'Una web de estética automotriz para explorar el trabajo de FullDip Sur. La portada audiovisual conduce a un configurador que permite combinar colores por piezas, una galería de trabajos del taller, el catálogo de productos y los vehículos de ocasión. Negro, verde ácido y azul eléctrico acompañan una navegación pensada para descubrir acabados y consultar al equipo por WhatsApp.',
    image: '/proyectos/fulldip-sur.webp',
    services: ['Diseño y desarrollo', 'Configurador visual', 'Catálogo y ocasión'],
  },
  {
    id: 'granja-orea',
    name: 'Granja Orea · Orea Camp',
    url: 'https://www.oreacamp.com/',
    domain: 'oreacamp.com',
    sector: 'Granja escuela, campamentos e hípica',
    location: 'Ciudad Real',
    description:
      'Una web editorial para descubrir Granja Orea y Orea Camp. Vídeo, fotografía y contenidos organizan campamentos, visitas escolares, hípica y estancias de grupo. El proyecto conecta consultas por WhatsApp, noticias administrables, una aplicación web instalable y un recorrido móvil mediante QR, junto con herramientas privadas para coordinar la actividad del equipo. Una experiencia digital que lleva el carácter de la granja a cada pantalla.',
    image: '/proyectos/granja-orea.webp',
    services: ['Diseño y desarrollo', 'PWA y recorrido QR', 'Gestión de contenidos'],
  },
  {
    id: 'f5-arquitectos',
    name: 'F5 Arquitectos',
    url: 'https://www.f5arquitectos.com/',
    domain: 'f5arquitectos.com',
    sector: 'Estudio de arquitectura',
    location: 'Ciudad Real',
    description:
      'Un portfolio de arquitectura que da espacio a cada proyecto. Imágenes a gran formato, composición editorial y una navegación contenida ponen las obras en primer plano. El catálogo por categorías y las fichas detalladas permiten explorar el trabajo del estudio, mientras una administración propia facilita mantener proyectos y contenidos al día. Una presencia digital construida alrededor de los espacios y de quienes los habitan.',
    image: '/proyectos/f5-arquitectos.webp',
    services: ['Diseño y desarrollo', 'Portfolio de arquitectura', 'Panel de gestión'],
  },
  {
    id: 'quality-homes',
    name: 'Quality Homes CR',
    url: 'https://www.qualityhomescr.es/',
    domain: 'qualityhomescr.es',
    sector: 'Promoción inmobiliaria residencial',
    location: 'Ciudad Real',
    description:
      'Una web inmobiliaria clara y visual para descubrir promociones en Ciudad Real. Fotografías, vídeo, planos y disponibilidad por vivienda ayudan a conocer cada propuesta y dar el siguiente paso. Las consultas se conectan con un CRM propio y la gestión de contenidos permite actualizar las promociones. Un diseño luminoso y cuidado que acompaña al visitante desde la primera imagen hasta el contacto con el equipo.',
    image: '/proyectos/quality-homes.webp',
    services: ['Diseño y desarrollo', 'Catálogo inmobiliario', 'CRM y contenidos'],
  },
  {
    id: 'megias-frutas',
    name: 'Frutas Megías',
    url: 'https://megias-fruta.vercel.app/',
    domain: 'megias-fruta.vercel.app',
    sector: 'Distribución mayorista de frutas y verduras',
    location: 'Ciudad Real',
    description:
      'Una presencia digital con el color y el carácter de un mayorista de frutas y verduras. Fotografía de producto, información para distintos sectores profesionales y contenido editorial se unen en una web ágil que facilita la consulta directa. La estructura presenta la actividad de la empresa y sus productos con claridad, con una experiencia adaptada al móvil y contenido orientado a su mercado local.',
    image: '/proyectos/megias-frutas.webp',
    services: ['Diseño y desarrollo', 'Web corporativa B2B', 'Contenido y SEO local'],
  },
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
