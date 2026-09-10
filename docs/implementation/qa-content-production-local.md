# QA de contenido sobre producción local

10 de septiembre de 2026. Servidor `http://localhost:3010`, primer build de producción local de esta entrega; Chrome 150 mediante sesión `latech-content-qa`. Ventanas de 390 × 844 y 1440 × 960. La sesión se cerró al terminar. No se probaron ni modificaron servicios en producción.

## Resultados observados

| Área | Comprobación | Resultado |
| --- | --- | --- |
| Blog SSR | HTML HTTP sin JavaScript: doce tarjetas, H1, canonical y enlaces | Correcto |
| Búsqueda | `diseño` y `diseno` devuelven los mismos artículos; término inexistente muestra salida útil | Correcto |
| Navegación | Categoría conserva query; limpiar, atrás y adelante recuperan URLs; página 2 cambia artículos | Correcto |
| Indexación técnica | Búsquedas `noindex, follow`; página 2 canonical propio; página 999 HTTP 404 | Correcto |
| Lectura | Índice del artículo WordPress lleva al H2 con margen superior de unos 130 px | Correcto |
| Móvil | Listado y artículo sin ensanchar documento a 390 px; tabla y código de la pieza QA dentro de áreas desplazables | Correcto |
| Briefing | Selecciones, integración, materiales, responsable, advertencia por urgencia y documento coherente | Correcto |
| Persistencia | Sin copia antes de optar; recarga restaura al hidratar; desactivar elimina copia; cancelar reinicio conserva y confirmar vacía | Correcto |
| Dos pestañas | Otra copia pausa guardado, conserva respuestas actuales y se carga solo con botón explícito | Correcto |
| Cambio de proyecto | Conserva texto, retira funciones incompatibles y muestra advertencia de derivación humana en IA | Correcto |
| Entrada desde artículo | El enlace WordPress abre la decisión; no marca proyecto ni función hasta incorporar | Correcto |
| Copia y WhatsApp | Portapapeles bloqueado muestra texto seleccionable; href contiene documento y número esperado; enlace no abierto | Correcto |
| Almacenamiento bloqueado | Briefing informa sin afirmar guardado y permite seguir; Misterio permite completar sin guardar | Correcto |
| Misterios | Reserva, carrito y búsqueda: problema, corrección, nueva prueba, resultado y repetición | Correcto |
| Progreso | Tras recargar, los tres episodios constan resueltos en el listado y permiten repetirse | Correcto |
| Búsqueda de demo | `cafe`, `CAFÉ` y ` café ` encuentran el mismo producto después de la corrección | Correcto |
| Editor privado | Slug automático; vista previa; colisión visible mantiene contenido; guardar fija la URL; recarga mantiene borrador | Correcto |
| Publicación local | Borrador HTTP 404; publicar muestra artículo; retirar devuelve 404; eliminar quita pieza de lista | Correcto |
| Markdown | H2/H3 e índice; tabla y código; HTML se muestra como texto y enlace `javascript:` no se activa | Correcto |

El acceso del editor se preparó con autenticación HTTP ADMIN local, ya comprobada por el smoke del coordinador. El estado se guardó con permiso 600 en `.local`, se cargó por nombre y se eliminó inmediatamente. Ninguna credencial apareció en argumentos, resultados o capturas. No se contabiliza como prueba visual del formulario de acceso.

La única pieza creada por UI fue `qa-content-ui-2026-09-10`; se retiró y eliminó al terminar. Se verificaron su ausencia del listado y HTTP 404. No se editó ninguno de los artículos históricos.

## Defecto de impresión y corrección

El PDF inicial contenía solo el documento correcto, pero el pie quedaba aislado en una segunda página. Se ajustaron los espacios de listas y secciones en `briefing.module.css`, y la continuidad del pie. La misma propuesta aplicada a los estilos de impresión del navegador produjo una página A4 legible, sin cortes ni controles. PDF y PNG revisados por este agente y por root.

**Verificado en el quinto build local:** el PDF real generado sin inyectar CSS contiene una página A4 para el mismo briefing de prueba. Se renderizó con Poppler y se inspeccionó la página completa: texto legible, secciones completas, pie integrado y ningún control del formulario. Para un briefing más largo se permiten varias páginas con contenido, manteniendo encabezados y párrafos legibles.

## Repetición final sobre el quinto build

Build `EXwr7f1qR5891HUKhrLTQ`, mismo servidor local, Chrome headless único con ventanas de 1440 × 960 y 390 × 844. Las siete etapas terminaron correctamente y el navegador se cerró en `finally`.

- Acceso ADMIN mediante formulario, cierre inmediato desde Sidebar, cero cookies de sesión y navegación de red `/admin` redirigida a `/admin/login`.
- Acceso CLIENT mediante formulario a `/dashboard`, cierre desde Seguridad, cero cookies de sesión y ruta privada redirigida a `/login`.
- Listado con 82 artículos de QA. Nueva pieza `/blog/preparar-briefing-web-en-el-navegador` con un solo H1, índice enlazado, canonical correcta y sin notas editoriales internas. Capturas móvil y escritorio inspeccionadas; documento sin desbordamiento horizontal a 390 px.
- URL histórica `/blog/cuanto-cuesta-pagina-web-espana` preservada con el cuerpo preparado, oferta 600 € y mantenimiento 60 €/mes. Tabla contenida en región desplazable; un solo H1 y sin notas internas.
- PDF real del briefing completo, producido con el CSS compilado y sin estilos inyectados. Una página A4 inspeccionada visualmente, incluido el pie.

El acceso usó cuentas ficticias leídas privadamente por el script desde un archivo 600; no se imprimieron secretos ni se tomaron capturas de formularios con credenciales. Esta ronda detectó y permitió corregir la carrera de cierre de sesión registrada en `auth-signout-race.md`; la repetición del quinto build ya pasa.

## Evidencias

Archivos ignorados en `output/playwright`:

- `blog-mobile-390.png`, `blog-desktop-1440.png`, `blog-article-anchor-390.png`.
- `briefing-empty-390.png`, `briefing-report-390.png`.
- `briefing-qa.pdf` y sus páginas PNG: evidencia del corte inicial.
- `briefing-qa-css-proposal.pdf`, `briefing-qa-css-proposal-1.png`: propuesta corregida.
- `briefing-compiled-build5.pdf`, `briefing-compiled-build5-page-1.png`: PDF del CSS compilado y render completo inspeccionado.
- `auth-content-build5-results.json`: siete etapas aprobadas y navegador cerrado.
- `editorial-briefing-build5-1440.png`, `editorial-briefing-build5-390.png`, `editorial-price-build5-390.png`: revisión del contenido preparado en el frontend.
- `mystery-booking-complete-390.png`, `mystery-cart-complete-390.png`, `mystery-search-complete-390.png`, `mysteries-progress-390.png`.
- `editor-preview-1440.png`, `editor-public-table-390.png`: esta última conserva una imagen de fixture con ruta inicial inexistente; se corrigió a `/window.svg` en la pieza temporal antes de retirarla. No corresponde a una imagen editorial publicada.

## Alcance y límites

El primer build mostraba sesenta artículos de la fixture inicial. El responsable completó después los dieciséis históricos restantes; no confundir ese conjunto local incompleto con pérdida de URLs de producción. El mapa editorial conserva los 76 originales. La vista editorial optativa de 82 piezas quedó comprobada en el quinto build; no se importó ni publicó ese contenido en producción.

Los errores de consola observados correspondían a Analytics de Vercel no servido en localhost y a la imagen de fixture citada; hubo avisos de precarga CSS. No se observó un error de ejecución que rompiera los recorridos comprobados.

No se abrió WhatsApp ni se enviaron solicitudes reales, reservas, pedidos, correos o publicaciones. La comprobación de las seis entradas del briefing sigue cubierta por pruebas y código; la interacción de navegador de esta ronda recorrió la entrada de WordPress. No se afirma aquí una prueba visual individual de las otras cinco.
