export type Miembro = {
  slug: string;
  nombre: string;
  rol: string;
  lema?: string;
  descripcion: string[];
  foto: { src: string; width: number; height: number; alt: string };
  esFundador: boolean;
};

export const equipo: Miembro[] = [
  {
    slug: 'fundadores',
    nombre: 'Andrés Rubio · Luis Grondona',
    rol: 'Fundadores',
    lema: 'Crecer contigo no es un objetivo, es nuestro compromiso.',
    descripcion: [
      'Somos Andrés y Luis, dos amigos que decidieron convertir un propósito de vida en un proyecto real: ayudar a las personas que nos rodean a avanzar, mejorar y crecer. Todo comenzó de forma natural, apoyando a familiares y amigos en sus proyectos, hasta que descubrimos que nuestras habilidades y conocimientos podían ir mucho más allá.',
      'Con el tiempo, dimos el paso hacia el ámbito profesional, enfocándonos en ayudar a empresas y pequeños negocios que se encontraban estancados, sin visibilidad o sin una estrategia clara para evolucionar. Hoy, acompañamos a nuestros clientes en su crecimiento, mejorando su presencia online, ayudándoles a captar más clientes y construyendo una imagen sólida, profesional y con prestigio.',
      'Lo que empezó como una iniciativa, hoy es mucho más que un trabajo: es nuestra pasión. Nos motiva ver resultados reales, negocios que crecen mes a mes, proyectos que avanzan y objetivos que se cumplen gracias a un trabajo conjunto.',
      'Para lograrlo, hemos reunido un equipo de profesionales especializados en digitalización, estrategia online y desarrollo de negocio. Combinamos conocimiento técnico con visión empresarial para ofrecer soluciones adaptadas a cada cliente, porque entendemos que cada proyecto es único.',
      'Vivimos en un entorno donde los pequeños y medianos negocios compiten constantemente con grandes empresas que cuentan con más recursos y visibilidad. Por eso estamos aquí: para equilibrar esa balanza. Nos implicamos personalmente en cada proyecto, entendiendo no solo el negocio, sino también el esfuerzo, la ilusión y la forma de vida que hay detrás de cada emprendimiento.',
      'Sabemos lo importante que es hoy en día destacar en el mundo digital. Por eso trabajamos para que tu empresa tenga la visibilidad, la presencia y el prestigio que merece, posicionándote de forma profesional y estratégica tanto en buscadores como en redes sociales.',
      'Para nosotros, cada cliente es mucho más que un número. Es una persona, una historia y un proyecto en el que creemos. Por eso, trabajamos contigo de forma cercana, transparente y comprometida, como si fuera nuestro propio negocio.',
      'Porque al final, no se trata solo de crecer…',
      'Se trata de crecer juntos.',
    ],
    foto: {
      src: '/equipo/fundadores/foto.jpeg',
      width: 688,
      height: 1529,
      alt: 'Foto de Andrés Rubio y Luis Grondona, fundadores de Latech',
    },
    esFundador: true,
  },
  {
    slug: 'jose-luis-grondona',
    nombre: 'José Luis Grondona',
    rol: 'Jefe de equipo en visibilidad digital',
    descripcion: [
      'José Luis Grondona cuenta con más de 30 años de experiencia en la creación y posicionamiento de páginas web, habiendo trabajado en distintos ámbitos de la digitalización.',
      'Nacido en Madrid, ha desarrollado su trayectoria por toda España colaborando con empresas, gestionando webs corporativas, tiendas online y también impulsando sus propios negocios.',
      'Hoy forma parte de nuestro equipo, aportando su experiencia, asesorando y participando activamente en cada proyecto de nuestros clientes.',
    ],
    foto: {
      src: '/equipo/jose-luis-grondona/foto.jpeg',
      width: 1254,
      height: 1254,
      alt: 'Foto de José Luis Grondona, jefe de equipo en visibilidad digital en Latech',
    },
    esFundador: false,
  },
  {
    slug: 'ricardo-perez',
    nombre: 'Ricardo Pérez',
    rol: 'Community Manager',
    descripcion: [
      'Ricardo Pérez es diseñador gráfico especializado en identidad visual. Estudió el Grado en Diseño Gráfico, una disciplina enfocada en la comunicación visual, creación de logotipos y desarrollo de marca.',
      'Impulsado por la búsqueda de nuevas oportunidades fuera de su país natal, Venezuela, llegó a España donde comenzó a trabajar de forma independiente en su profesión.',
      'Hoy forma parte de nuestro equipo, participando en cada proyecto que lo requiere y encargándose del diseño de los logotipos de nuestros clientes.',
    ],
    foto: {
      src: '/equipo/ricardo-perez/foto.jpeg',
      width: 941,
      height: 1672,
      alt: 'Foto de Ricardo Pérez, community manager en Latech',
    },
    esFundador: false,
  },
];
