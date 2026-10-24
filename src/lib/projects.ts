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
    id: 'colegio-santo-tomas',
    name: 'Colegio Santo Tomás',
    url: 'https://colegiosantotomas.es/',
    domain: 'colegiosantotomas.es',
    sector: 'Educación · de 0 a 18 años',
    location: 'Ciudad Real',
    description:
      'Una web que acompaña a las familias desde el primer descubrimiento del colegio. Fotografía real, una identidad editorial cálida y recorridos por las etapas educativas muestran su proyecto de 0 a 18 años. Admisiones, noticias, agenda y documentos conviven con una galería privada para padres. Una experiencia pensada para acercar la vida del centro y hacer más fácil encontrar la información de cada día.',
    image: '/proyectos/colegio-santo-tomas.webp',
    services: ['Diseño y desarrollo', 'Información para familias', 'Galería privada'],
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
    url: 'https://frutasmegias.com/',
    domain: 'frutasmegias.com',
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
    id: 'autoescuela-agora',
    name: 'Autoescuela Ágora',
    url: 'https://autoescuelaagora.com/',
    domain: 'autoescuelaagora.com',
    sector: 'Autoescuela y formación vial',
    location: 'Montijo y Puebla de la Calzada (Badajoz)',
    description:
      'Una web que acompaña al alumno desde la primera consulta hasta su próximo carnet. Vídeo, una identidad visual propia y recorridos por los permisos presentan las dos sedes de Ágora. La inscripción, el contacto por WhatsApp, los accesos a tests AEOL y el área Mi Ágora acercan la formación al móvil, mientras las noticias y guías mantienen la información de la autoescuela al día.',
    image: '/proyectos/autoescuela-agora.png',
    services: ['Diseño y desarrollo', 'Inscripción y área de alumnos', 'Web instalable'],
  },
  {
    id: 'precios-locos',
    name: 'Precios Locos',
    url: 'https://www.precioslocosmontijo.com/',
    domain: 'precioslocosmontijo.com',
    sector: 'Electrodomésticos y productos para el hogar',
    location: 'Montijo (Badajoz)',
    description:
      'Una tienda con una personalidad que se reconoce desde el primer vistazo. Rojo, amarillo y una máquina de gancho de paquetes sorpresa dan carácter a una experiencia de compra que combina catálogo, buscador, favoritos y carrito. Las fichas de producto, las guías para el hogar y el contacto directo por WhatsApp conectan la tienda de Montijo con quienes buscan su próxima compra online.',
    image: '/proyectos/precios-locos.png',
    services: ['Diseño y desarrollo', 'Catálogo y carrito', 'Experiencia interactiva'],
  },
  {
    id: 'los-leones-nuptiae',
    name: 'Los Leones · Nuptiae',
    url: 'https://losleones-nuptiae.com/',
    domain: 'losleones-nuptiae.com',
    sector: 'Moda masculina, ceremonia y sastrería',
    location: 'Mérida (Badajoz)',
    description:
      'Dos identidades de moda reunidas en una misma experiencia digital. Una entrada visual permite elegir entre Los Leones y Nuptiae, con recorridos propios para moda masculina, ceremonia, alquiler y confección a medida. La fotografía sitúa ambas marcas en Mérida y las colecciones se acompañan de accesos a sus tiendas, manteniendo una atención personal también desde el móvil.',
    image: '/proyectos/los-leones-nuptiae.png',
    services: ['Diseño y desarrollo', 'Dos identidades de marca', 'Colecciones de moda'],
  },
  {
    id: 'my-special-hair',
    name: 'MySpecialHair',
    url: 'https://myspecialhair.com/',
    domain: 'myspecialhair.com',
    sector: 'Prótesis capilares y cuidado del cabello',
    location: 'Atención online y centro colaborador en Badajoz',
    description:
      'Una web de marca para descubrir prótesis capilares y productos de cuidado con orientación personal. El catálogo, la guía de medidas y el estudio 3D ayudan a explorar opciones, mientras la cuenta de cliente, las citas y el acceso profesional ofrecen recorridos propios para cada visitante. Vídeo, una galería de resultados y una identidad visual cuidada conectan la presentación de la marca con el asesoramiento directo por WhatsApp.',
    image: '/proyectos/my-special-hair.webp',
    services: ['Diseño y desarrollo', 'Catálogo y área de clientes', 'Guía de medidas y estudio 3D'],
  },
];
