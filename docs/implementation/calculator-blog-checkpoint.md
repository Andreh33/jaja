# Calculadora, blog, briefing y contenido — continuidad

Actualizado el 10 de septiembre de 2026. Agente `seo_blog`.

## Entorno y límites

Árbol verificado: `/home/andreh/.codex-worktrees/latech-evolution-2026-09-10`, rama `codex/latech-evolution-2026-09-10`. Hay cambios compartidos de varios agentes; no sobrescribirlos. No commits, push, despliegues ni cambios en la BDD remota por este agente. Root coordina dependencias, typecheck, build y una única ventana de navegador por la memoria disponible. Las sesiones propias de navegador y comandos están cerradas.

## Trabajo implementado

- Calculadora: contrato público en `src/lib/quotes/catalog.ts`, 600 € de creación, 60 €/mes web u 80 €/mes tienda, IVA no incluido y extras separados. Cinco etapas, contexto opcional, revisión, copia y apertura explícita de WhatsApp. Guardado de selecciones con versión y límites, sin contactos ni contraseñas; elimina el formato legado. Root modificó después Analytics en `CalculadoraClient.tsx`; no tocarlo sin coordinar.
- Blog: búsqueda SSR sin distinción de tildes en título, resumen y categoría; doce resultados por página, filtros conservados y 404 fuera de rango. Parser compartido markdown-it con HTML deshabilitado, URLs permitidas, índice H2/H3, tablas, código e imágenes. Los errores de tipos en atributos del parser se corrigieron con conversión a `String`.
- Editor y API: vista previa privada, guardas ADMIN y origen, validación, colisiones 409, URL fija tras primer guardado, autor conservado, lectura calculada por servidor y revalidación. Conserva la protección de artículos publicados de `repo_architecture`. Fechas existentes NULL siguen desconocidas; el esquema no identifica una publicación histórica retirada. No se añadieron migraciones ni fechas editoriales ficticias.
- Briefing: tres tipos de proyecto, requisitos, materiales, integraciones, responsables, advertencias y criterios. Seis entradas desde artículos reales requieren clic explícito. Guardado opcional con límites, reinicio, copia y alternativa manual, impresión del documento y WhatsApp revisable. Los eventos analíticos solo llevan valores predefinidos. Una copia de otra pestaña ahora se ofrece para cargar expresamente, conservando el texto local mientras el usuario decide.
- Revisión de integración: progreso de Misterios recuperable y visible, eventos entre pestañas, rutas relacionadas comprobadas, avisos sin JavaScript y metadata específica. El sitemap omite `lastModified` cuando la publicación no tiene fecha. `games_product` corrigió el resultado tardío del ranking que podía repoblar datos tras volver al menú; no editamos sus archivos.

Detalles: `blog-briefing-delivery.md` y `review-lab-integration.md`.

## Entregable editorial preparado

`docs/editorial` contiene catorce cuerpos completos: ocho actualizaciones de URLs existentes, cuatro borradores nuevos y dos casos propios verificables de Latech. Total comprobado: 8.305 palabras de cuerpo. Incluye mapa de las 76 URLs existentes más seis propuestas únicas, calendario de 90 días, fuentes oficiales y evidencia local, 28 copys, catorce guiones y catorce propuestas de ficha visual. Los guiones no son vídeos ya producidos.

No se ha publicado ni importado contenido en producción. El responsable de la fixture confirmó la incorporación optativa en QA local: 76→82, ocho reemplazos y seis altas, con IDs y fechas existentes conservados. Los otros 68 artículos siguen pendientes de revisión factual. Los casos propios no acreditan resultados de clientes. Antes de publicar hay que comprobar la oferta y versión pública, revisar el texto y autorizar su importación. No hay línea base de Search Console, leads o ventas validada, ni promesas de tráfico.

## Evidencia con alcance

- Histórico verificado: doce pruebas propias de calculadora antes de los ajustes de Analytics de root.
- Histórico verificado: veinte pruebas de blog/editor, visibilidad pública y briefing después del tratamiento de slugs y fechas NULL; lint focal sin avisos.
- Verificado tras la revisión: dieciséis pruebas de Misterios, briefing y Trazo; lint focal de Misterios, briefing y sitemap terminó con código 0. Después se ampliaron las comprobaciones de rutas relacionadas y tamaños de progreso: cuatro pruebas de Misterios volvieron a pasar, sesión `71660` finalizada.
- Verificado editorial: catorce cuerpos con marcadores, mínimo 450 palabras por pieza, enlaces internos reconocidos, 82 URLs únicas en el mapa y sin cambios en `scripts/posts-data`. Los artículos enlazan herramientas existentes de esta entrega, no borradores aún sin publicar.
- La prueba global y QA visual final corresponden a root. No extender estas pruebas históricas a cambios posteriores de otros agentes ni afirmar verificación visual por este agente.

## Última ronda de QA y vista editorial

QA real del primer build local terminada: `qa-content-production-local.md` registra blog, briefing, tres Misterios y editor privado. Sesión Chrome `latech-content-qa` cerrada; pieza temporal de QA eliminada y estado de autenticación privado borrado. Se corrigió un pie huérfano en el PDF con CSS de impresión; la propuesta y el PDF real del quinto build pasaron la inspección visual completa. Root había inspeccionado también la propuesta.

Nuevo helper `scripts/lib/editorial-preview.ts`: transforma optativamente la colección histórica de 76 artículos en 82, con ocho reemplazos y seis altas; parser de metadatos estricto, extracción de cuerpo sin notas ni H1 duplicado. Sin DB, entorno, fechas ni banderas de publicación. `repo_architecture` integra la opción explícita de QA. Seis pruebas focales y lint pasaron tras la versión final; sesión `18304` cerrada.

## Siguiente paso

El Lighthouse del segundo build detectó 29 textos con contraste insuficiente, salto H4 en Footer y enlace «Empezar» genérico. Se corrigieron solo clases de texto, jerarquía de Footer y CTA Navbar en doce componentes, coordinando WordPress/TechMarquee/Playground con el responsable de rendimiento. Lint focal y diff-check pasaron; todos los fondos medidos dan contraste calculado mínimo 7,27:1 con la propuesta. El nuevo score renderizado sigue pendiente. Detalle: `lighthouse-a11y-corrections.md`.

El cuarto build local permitió reproducir un defecto de cierre de sesión: una precarga privada podía renovar la cookie después de sign-out. Verificado por tiempos y recuentos, sin registrar valores secretos. Se mantiene Auth.js y se retira Set-Cookie de la respuesta final del proxy privado; sus endpoints permanecen intactos. Tres pruebas con JWT y endpoints Auth reales, base en memoria, pasaron; lint focal también. Revisión independiente favorable. Detalle en `auth-signout-race.md`.

Quinto build local `EXwr7f1qR5891HUKhrLTQ` aprobado por root y comprobado en navegador por este agente: siete etapas PASS. ADMIN/CLIENT login y cierre inmediato dejan cero cookies y sus guardas redirigen; listado de 82 piezas, nueva pieza de briefing y URL histórica de precios correctos. PDF con CSS compilado sin inyección, A4 de una página, renderizado e inspeccionado completo. Evidencia `output/playwright/auth-content-build5-results.json`, `briefing-compiled-build5.pdf` y `briefing-compiled-build5-page-1.png`. Navegador propio cerrado en finally; appsource sigue congelado. No queda una prueba propia pendiente de este alcance. Root centraliza la entrega global. No publicar el paquete editorial en producción automáticamente ni repetir la ronda completa sin hallazgos que lo justifiquen.
