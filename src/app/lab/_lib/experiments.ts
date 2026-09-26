export const experiments = [
  {
    slug: 'rank-rush', title: 'Rank Rush', category: 'Juego', number: '01',
    description: 'Tu web empieza abajo. Pulsa, gana posiciones y no pierdas el ritmo: cuanto más cerca estás de la cima, más cuesta mantenerte.',
    short: 'La cima no se regala. Se conquista.',
    action: 'Abrir Rank Rush',
    controls: ['Empieza y pulsa repetidamente el botón con el ratón, el dedo, espacio o enter.', 'Mantén el ritmo para subir. Si aflojas, tu web pierde posiciones. Tienes 60 segundos de juego activo.', 'Pausa con P, Escape o el botón. Puedes elegir Ritmo suave antes de empezar o durante una pausa.'],
    detail: 'Un arcade de reflejos dentro de un buscador ficticio. La presión aumenta durante la subida y cada partida invita a mejorar tu tiempo. El modo suave permite jugar a un ritmo más tranquilo.',
    privacy: 'Es una simulación independiente, no afiliada a Google. El SEO real no funciona a clics. El récord se guarda solo en este dispositivo si permite almacenamiento; no hay clasificación online ni peticiones a buscadores.',
  },
  {
    slug: 'escape', title: 'Escapa de la web', category: 'Juego', number: '02',
    description: 'Salta entre fragmentos de una web, esquiva obstáculos y enfréntate a sus jefes. Elige campaña o infinito y publica tu puntuación si te apetece.',
    short: 'La página se convierte en tu escenario.',
    action: 'Abrir el juego',
    controls: ['Espacio o flecha arriba para saltar. Puedes hacer un segundo salto en el aire.', 'Mayúsculas o flecha derecha para el impulso. En móvil, usa los botones del juego.', 'Elige el modo y la dificultad antes de jugar. Pausa desde el control del juego.'],
    detail: 'Un juego dentro de la propia página, con escenarios, colisiones y controles hechos a medida. La campaña propone un recorrido; infinito pone a prueba cuánto aguantas.',
    privacy: 'El récord local se guarda en este navegador si el almacenamiento está disponible. Publicar en el ranking es opcional y muestra el alias que elijas. Las clasificaciones separan modo y dificultad.',
  },
  {
    slug: 'runner', title: 'Latech Runner', category: 'Juego', number: '03',
    description: 'Un recorrido de saltos, monedas y obstáculos. Encuentra el momento para el doble salto y supera tu marca en este dispositivo.',
    short: 'Un salto más. Una moneda más.',
    action: 'Cargar el runner',
    controls: ['Pulsa Jugar para empezar. Usa espacio, flecha arriba o toca la zona de juego para saltar.', 'Vuelve a saltar en el aire para alcanzar más altura.', 'Usa Pausa cuando lo necesites. Al salir de la pestaña la partida también se detiene.'],
    detail: 'Un juego de habilidad con controles de teclado y táctiles. La velocidad y los obstáculos convierten cada intento en una nueva oportunidad de mejorar.',
    privacy: 'El récord permanece en este navegador si permite almacenamiento local. Este juego no publica una clasificación online.',
  },
  {
    slug: 'lienzo', title: 'Lienzo libre', category: 'Crea', number: '04',
    description: 'Dibuja con los colores de Latech, cambia de pincel, deshaz y descarga tu creación. Un pequeño espacio para pensar con las manos.',
    short: 'Tu próxima idea empieza con un trazo.',
    action: 'Abrir el lienzo',
    controls: ['Elige un color y grosor. Dibuja con ratón, lápiz o el dedo dentro del lienzo.', 'Usa la goma, deshacer y rehacer para ajustar tu idea.', 'Descarga el resultado en PNG. El botón de limpiar te permite empezar de nuevo.'],
    detail: 'El lienzo mantiene las proporciones del dibujo al cambiar de tamaño y conserva un historial de acciones. Puedes explorar una idea sin abrir otra aplicación.',
    privacy: 'El dibujo se guarda en este dispositivo si el navegador lo permite. No se sube a nuestros servidores. Descarga una copia para conservarlo fuera del navegador.',
  },
  {
    slug: 'capo', title: 'Abre el capó', category: 'Explora', number: '05',
    description: 'Mira un ejemplo de las piezas que dan vida a Latech: páginas, contenido e interacción. Una visita guiada a nuestra forma de construir.',
    short: 'Lo que hace posible lo que ves.',
    action: 'Abrir el capó',
    controls: ['Abre el ejemplo y recorre las piezas de la página.', 'En una pantalla pequeña puedes desplazar el código horizontalmente.', 'Cierra con el botón de cierre o con Escape.'],
    detail: 'Una explicación visual de cómo se conectan el diseño, el contenido y la interacción. El código que aparece es una ilustración simplificada.',
    privacy: 'El ejemplo no muestra código privado, credenciales ni datos de clientes. No es un inspector en tiempo real ni una prueba de rendimiento.',
  },
  {
    slug: 'rayos-x', title: 'Rayos X', category: 'Explora', number: '06',
    description: 'Separa la página en capas y descubre sus secciones. Gira la representación o recórrela como una lista para ver cómo se organiza.',
    short: 'Otra perspectiva de la misma web.',
    action: 'Activar Rayos X',
    controls: ['Gira las capas con el ratón o el dedo, o usa los botones de dirección.', 'Usa Ver lista si prefieres leer las secciones sin perspectiva.', 'Restablece el ángulo con el control de reinicio y cierra con Escape.'],
    detail: 'Una representación de las secciones y los títulos presentes en esta página. Conecta la estructura del contenido con su presentación visual.',
    privacy: 'La vista lee las secciones públicas de esta página en tu navegador. Sus capas son una interpretación visual; no reproducen toda la geometría del documento.',
  },
] as const;

export type Experiment = (typeof experiments)[number];
export type ExperimentSlug = Experiment['slug'];
export function getExperiment(slug: string) { return experiments.find((experiment) => experiment.slug === slug); }
