export type MysteryId = 'la-reserva-imposible' | 'el-carrito-sorpresa' | 'la-busqueda-que-no-encuentra';
export type Mystery = {
  slug: MysteryId; number: string; title: string; category: string; description: string;
  objective: string; clue: string; choices: { id: string; label: string; explanation: string }[];
  correctChoice: string; lesson: string; checklist: string[]; article: string; articleLabel: string; service: string;
};
export const MYSTERIES: Mystery[] = [
  {
    slug: 'la-reserva-imposible', number: '01', title: 'La reserva imposible', category: 'Experiencia móvil',
    description: 'Una peluquería tiene horas libres, pero su web no deja terminar la reserva. Encuentra el obstáculo y comprueba la solución.',
    objective: 'Elige un servicio y una hora e intenta confirmar la cita.',
    clue: 'La promoción fija ocupa el mismo espacio que la acción principal. Añadir elementos puede quitarle espacio a lo que importa.',
    correctChoice: 'flow',
    choices: [
      { id: 'color', label: 'Cambiar el color de la confirmación', explanation: 'El contraste importa, pero el botón seguiría tapado por la promoción.' },
      { id: 'flow', label: 'Colocar la promoción dentro del contenido', explanation: 'La promoción conserva su sitio y la confirmación vuelve a estar disponible.' },
      { id: 'smaller', label: 'Reducir todo el texto', explanation: 'Hacerlo más pequeño perjudica la lectura y no evita que la barra se superponga.' },
    ],
    lesson: 'Las barras fijas deben respetar el espacio de las acciones y las zonas seguras del móvil. Una reserva no termina hasta que la confirmación resulta accesible.',
    checklist: ['Prueba la reserva completa en una pantalla pequeña.', 'Comprueba el último botón con teclado, zoom y barras visibles.', 'Muestra una confirmación clara y ofrece una salida si algo falla.'],
    article: '/blog/pagina-web-restaurantes', articleLabel: 'Una web preparada para recibir reservas', service: '/tienda/web',
  },
  {
    slug: 'el-carrito-sorpresa', number: '02', title: 'El carrito sorpresa', category: 'Compra transparente',
    description: 'El pedido parece costar una cosa y acaba costando otra. Reordena la información para que comprar no sea una sorpresa.',
    objective: 'Revisa la cesta y continúa hasta ver el total del pedido de ejemplo.',
    clue: 'El envío no es un detalle después de decidir. Es parte del precio que necesita conocer quien compra.',
    correctChoice: 'total',
    choices: [
      { id: 'total', label: 'Mostrar productos, envío y total desde la cesta', explanation: 'La persona puede decidir con toda la información antes de continuar.' },
      { id: 'discount', label: 'Añadir una cuenta atrás para un descuento', explanation: 'La urgencia no explica el coste del envío ni corrige el total incompleto.' },
      { id: 'hide', label: 'Mostrar solo el precio del producto', explanation: 'Ocultar el desglose mantiene la sorpresa justo al final del recorrido.' },
    ],
    lesson: 'El total y sus condiciones deben llegar antes de pedir un compromiso. Si el envío depende del destino, explica cómo se calcula y permite estimarlo.',
    checklist: ['Comprueba productos, impuestos, envío y descuentos por separado.', 'Indica cualquier condición antes de pedir datos de pago.', 'Verifica que cesta, resumen y confirmación coinciden.'],
    article: '/blog/envios-logistica-ecommerce-espana', articleLabel: 'Cómo organizar envíos y logística', service: '/tienda/online',
  },
  {
    slug: 'la-busqueda-que-no-encuentra', number: '03', title: 'La búsqueda que no encuentra', category: 'Contenido fácil de encontrar',
    description: 'El café está en el catálogo. El buscador dice que no existe. Investiga cómo interpreta lo que escribe el visitante.',
    objective: 'Busca «cafe» y comprueba si aparece el café del catálogo.',
    clue: 'El catálogo escribe «Café». Las mayúsculas, los espacios y las tildes no deberían decidir si el producto existe.',
    correctChoice: 'normalize',
    choices: [
      { id: 'remove', label: 'Quitar los productos que no aparecen', explanation: 'El producto existe. El problema está en cómo se compara la consulta.' },
      { id: 'normalize', label: 'Comparar sin distinguir tildes ni mayúsculas', explanation: '«cafe», «CAFÉ» y « café » encuentran el mismo producto.' },
      { id: 'instruction', label: 'Pedir que se escriba el nombre exacto', explanation: 'Eso traslada el trabajo al visitante y deja el mismo fallo en el buscador.' },
    ],
    lesson: 'Un buscador debe entender variaciones normales de escritura y explicar los resultados vacíos. La normalización resuelve este caso; sinónimos y búsquedas más complejas necesitan reglas adicionales.',
    checklist: ['Prueba consultas con y sin tildes y mayúsculas.', 'Conserva la consulta cuando no hay resultados.', 'Ofrece alternativas útiles sin inventar productos.'],
    article: '/blog/seo-tiendas-online-productos', articleLabel: 'Cómo organizar las fichas y el catálogo', service: '/tienda/online',
  },
];
export function getMystery(slug: string) { return MYSTERIES.find((episode) => episode.slug === slug); }
export const DEMO_PRODUCTS = ['Café de especialidad', 'Taza de cerámica', 'Filtro reutilizable'];
export function normalizeDemoSearch(query: string) { return query.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
export function searchDemoProducts(query: string, fixed: boolean) {
  const needle = fixed ? normalizeDemoSearch(query) : query.trim();
  return DEMO_PRODUCTS.filter((product) => (fixed ? normalizeDemoSearch(product) : product).includes(needle));
}
export const DEMO_BASKET = { products: 3400, shipping: 600, total: 4000 } as const;
export const MYSTERY_PROGRESS_KEY = 'latech-mysteries-v1';
export const MYSTERY_PROGRESS_EVENT = 'latech:mystery-progress';
export function parseMysteryProgress(raw: string | null): MysteryId[] {
  if (raw && raw.length > 2000) return [];
  try { const value: unknown = JSON.parse(raw ?? '[]'); return Array.isArray(value) ? MYSTERIES.filter((episode) => value.includes(episode.slug)).map((episode) => episode.slug) : []; } catch { return []; }
}
