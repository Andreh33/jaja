# Biblioteca, editor y briefing

Fecha de trabajo: 10 de septiembre de 2026. Rama local `codex/latech-evolution-2026-09-10`. No se han ejecutado migraciones, modificado artículos reales ni publicado cambios.

## Biblioteca y lectura

- `/blog` y `/blog/categoria/[categoria]` comparten `BlogLibrary`: búsqueda por palabras en título, resumen y categoría, sin distinguir tildes; filtros conservados en URL; 12 artículos por página; navegación SSR mediante enlaces y formulario GET. La búsqueda funciona sin JavaScript.
- Las páginas de búsqueda llevan `noindex,follow`; cada página sin consulta tiene su canonical de paginación. Los números fuera de rango devuelven 404. El listado solo recibe resúmenes de artículos publicados.
- `markdown-it@15.0.1`, instalado y fijado por el coordinador, sustituye el parser por expresiones regulares. Admite tablas con desplazamiento horizontal, listas, citas, código, imágenes HTTPS/locales y un índice de H2/H3 con anclas únicas. El H1 lo controla la página. HTML crudo y protocolos no permitidos no se ejecutan.
- La vista previa privada usa el mismo parser que el artículo. Las imágenes editoriales tienen carga diferida; no se han inventado ilustraciones ni modificado las 76 entradas existentes.

## Editor y protección de URLs

- Las páginas de edición y creación comprueban ADMIN antes de consultar o renderizar, además de las protecciones de la API. Los borradores y su OG continúan fuera de las rutas públicas.
- Un artículo nuevo empieza como borrador. Publicar, guardar borrador y retirar una publicación son acciones explícitas. La vista previa está dentro del editor autenticado y no crea una URL pública.
- La URL se normaliza a partir del título hasta que se personaliza. Se valida al guardar, las colisiones devuelven 409 y no se pierde el texto del editor al fallar.
- La URL queda fija desde el primer guardado. Esto preserva las direcciones incluso al retirar artículos antiguos cuya fecha de publicación es desconocida. Cambiar una URL requiere diseñar una redirección; no se realiza silenciosamente.
- Los controles se bloquean mientras se guarda para que una respuesta lenta no sustituya cambios escritos durante esa petición. Se avisa al cerrar una página con cambios sin guardar.
- La API conserva los controles de origen y ADMIN, calcula el tiempo de lectura, conserva autor y revalida listados, categorías, artículos relacionados, OG y sitemap.

### Límite de fechas sin migración

La tabla actual no distingue un borrador que nunca se publicó de un artículo retirado cuya fecha histórica era NULL. Por eso, una fecha existente NULL permanece desconocida al publicar o republicar. Un artículo creado y publicado en una misma operación registra esa fecha real. Una fecha conocida se mantiene en las ediciones.

No se emite `dateModified` usando la fecha de publicación. Para registrar correctamente primera publicación y modificaciones futuras, convendría añadir campos opcionales de historial editorial en una migración separada, con una estrategia para los registros antiguos. Esta entrega no ejecuta esa migración ni rellena fechas ficticias.

## Tu proyecto, sin puntos ciegos

Ruta: `/briefing`. Entrada directa adicional desde la cabecera del blog. Tipos: web de negocio, tienda online y agente IA/automatización.

El formulario y el documento comparten las mismas reglas en `src/lib/briefing.ts`. Incluye objetivo, público, funciones, integraciones, estado de materiales, responsable del mantenimiento, urgencia y contexto opcional. El documento reúne alcance a estudiar, materiales y responsables, integraciones a confirmar, preguntas para el proveedor y criterios de comprobación.

Las reglas detectan casos observables: urgencia con materiales pendientes; tienda sin responsable definido; agente sin derivación humana. No prometen una función, un presupuesto o una fecha. La calculadora se enlaza como paso distinto y no se duplican sus precios.

### Entradas desde artículos reales

| Artículo | Decisión sugerida |
| --- | --- |
| `wordpress-vs-web-a-medida` | Conservar URLs anteriores |
| `checklist-antes-de-encargar-web` | Revisar textos e imágenes |
| `pagina-web-restaurantes` | Reservas y citas |
| `tienda-online-moda-ropa` | Catálogo y responsable |
| `integrar-agente-ia-crm` | Conexión con CRM |
| `vender-en-el-extranjero-desde-espana` | Varios idiomas |

La integración se hace mediante un mapa de slugs y un componente, sin alterar la base de datos. Abrir un enlace no incorpora nada: la persona pulsa «Incorporar esta decisión». Si cambia de tipo de proyecto, se explica antes qué selecciones se retirarán; los textos y materiales permanecen.

### Guardado y salida

- Guardado optativo en `localStorage`, clave `latech_briefing_v1`, formato versionado y campos permitidos. Nunca se solicitan claves, documentos ni datos de clientes. Las entradas están acotadas.
- Lectura defensiva ante versiones desconocidas, JSON corrupto y almacenamiento bloqueado. Se puede seguir editando sin guardar. Si otra pestaña cambia o borra la copia, se conserva lo escrito en la página actual y se pausa el guardado. La persona decide si cargar la otra copia o guardar la actual.
- Desactivar el guardado elimina la copia. Reiniciar pide confirmar y borra respuestas y progreso. Si el navegador bloquea el borrado, el aviso lo explica sin afirmar que se ha eliminado.
- Imprimir abre el diálogo nativo, con CSS para mostrar solo el documento y permitir guardarlo como PDF. Copiar tiene alternativa de selección manual cuando el portapapeles no está disponible.
- WhatsApp abre un mensaje revisable hacia el mismo número de contacto que la calculadora. No hay petición de envío a un servidor ni confirmación ficticia de recepción.
- Eventos: `briefing_ready`, `briefing_decision_added`, `briefing_copy`, `briefing_print_open`, `briefing_whatsapp_open`. Solo incluyen el tipo de proyecto o el identificador permitido de la decisión. No incluyen texto libre ni se consideran un lead confirmado.

## Verificación

Pruebas de `blog-editor`, `public-posts` y `briefing`: 20 casos, con SQLite exclusivamente en memoria para publicación y colisiones. Cubren 76 entradas sin pérdida en paginación, tildes, parámetros anómalos, Markdown y URLs inseguras, borradores, fechas, URLs guardadas, seis slugs reales, reglas del documento, exportación completa, persistencia y ausencia de envíos automáticos.

El lint del bloque blog/briefing/editor/helpers y sus pruebas terminó sin errores ni avisos.

El coordinador ejecuta typecheck/build global y coordina una única sesión de navegador. La comprobación visual de esta entrega se documentará con sus resultados reales; este documento no la da por realizada.

## Mantenimiento

Revisar las reglas del briefing cuando cambien los servicios y los seis puntos de entrada al actualizar esos artículos. La búsqueda en memoria de resúmenes es proporcionada a 76 artículos; un catálogo editorial mucho mayor requeriría paginación y búsqueda en la consulta de base de datos. La demanda SEO y la calidad de los contactos se evaluarán con datos reales, sin atribuir visitas o ventas a esta implementación antes de medirlas.
