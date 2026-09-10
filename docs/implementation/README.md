# Entrega Latech · evolución de la web

Trabajo aislado en `codex/latech-evolution-2026-09-10`, a partir de `541870b15afaa7ba3392020acd7f229c408d35d7`. La carpeta original del portátil y la web publicada se conservan. Estado de esta entrega: implementación y comprobaciones locales; la publicación y sus recursos externos se registran por separado.

La implementación del build local está guardada en `7889772`, sobre el commit principal `c9f0606`. Después se hace explícita la firma de middleware de Auth.js para la comprobación de tipos del checkout limpio; ese ajuste conserva el comportamiento del proxy comprobado en navegador. La validación remota del PR compila la fuente posterior a ese ajuste.

## Qué cambia

| Área | Resultado implementado | Evidencia y límites |
| --- | --- | --- |
| Identidad y móvil | Se mantienen las dos frases de inicio, colores y tipografías. Móvil tiene jerarquía, navegación y controles propios; escritorio conserva su composición. | Capturas de home a 390, 820, 1280 y 1440 px. Menú con foco, Escape y restauración del desplazamiento. |
| Movimiento | Entrada de escritorio acotada; contenido principal visible desde HTML; movimiento reducido, efectos según puntero y carga diferida del área de juegos. | FAQ nativo, proceso y testimonios legibles sin JavaScript. Las experiencias interactivas explican cuándo lo necesitan. |
| Presupuesto | Cinco pasos, 600 € de creación, mantenimiento de web o tienda y extras desglosados; resumen revisable y mensaje de WhatsApp. | El mensaje no se envía automáticamente. Los datos personales no se conservan al recargar. No se alteran contratos de facturación existentes. |
| Juegos y Lab | Pizarra, Runner y Escape revisados, controles de teclado/táctiles, pausa y recuperación. Lab reúne experiencias con URL y explicación propias. | [QA de juegos](./games-qa.md); [ranking y contrato de datos](./latech-lab-ranking.md). |
| Trazo | Dibujo o preset → plataformas → partida → tarjeta PNG y enlace versionado al mismo recorrido. | Generación acotada, pruebas de física, partida completa en navegador y recuperación de enlaces inválidos. |
| Misterios | Tres negocios ficticios permiten reproducir un problema, corregirlo y comprobar el resultado. | Reserva, carrito y búsqueda se han completado en navegador; el progreso local se restaura y puede repetirse. |
| Blog y editor | Búsqueda sin distinción de tildes, categorías, paginación SSR, índice de lectura, Markdown seguro y editor privado con URLs estables. | [Entrega del blog](./blog-briefing-delivery.md); [contención de borradores y recuperación](./recovery-contact-drafts.md). |
| Briefing | Tres tipos de proyecto, decisiones desde seis artículos, documento editable, copia, impresión/PDF y guardado voluntario. | El conflicto entre pestañas conserva las respuestas actuales. El documento no promete una fecha, contratación o presupuesto. |
| Contenido y visitas | Ocho revisiones completas, cuatro guías nuevas, dos casos propios y materiales de distribución para 90 días. | [Paquete editorial](../editorial/README.md). Preparado para revisión; no se han publicado artículos ni enviado mensajes externos. |
| Medición | Eventos de uso, intención de contacto y navegación comercial; URL de analítica sin consultas, respuestas ni niveles compartidos. | [Significado de los eventos](./measurement.md). Falta línea base privada de Search Console; no se atribuyen visitas ni ventas a cambios aún sin publicar. |

## Comprobar y publicar

Vista de la [portada móvil](./previews/home-final-390.png), [portada de escritorio](./previews/home-final-1440.png), [calculadora](./previews/calculator-mobile-final.png) y [partida completada en Trazo](./previews/trazo-run-390.png). Son capturas del navegador local con datos de QA; no representan un despliegue publicado.

El [PDF de ejemplo del briefing](./previews/briefing-ejemplo.pdf) procede del CSS compilado del build 5, con información ficticia. Se ha comprobado una página A4 completa, sin cortes ni controles de la interfaz.

La verificación se realiza con una base SQLite local y datos ficticios. [Instrucciones reproducibles](./qa-local.md), [revisión independiente](./review-lab-integration.md) y [rastreo HTTP](./public-route-qa.md). Los resultados deben leerse junto con la versión que verificaron: una pasada anterior no acredita cambios posteriores.

El build 5 de producción local y su comprobación TypeScript terminan correctamente con 192 páginas generadas (`EXwr7f1qR5891HUKhrLTQ`). La suite global final pasa 140 pruebas en 28 suites, incluidas las tres regresiones adicionales de Auth.js con JWT reales aislados. El rastreo del build 4 comprobó 159 rutas y 24 OG sin hallazgos; los ajustes finales de contraste, cinta y proxy se comprueban por separado y no cambian ese contrato público. La [corrección del cierre de sesión](./auth-signout-race.md) conserva las guardas de acceso e impide que una precarga tardía restaure la cookie después de salir; acceso y cierre ADMIN/CLIENT se han repetido satisfactoriamente en el navegador del build 5.

El lint global final y la comprobación de espacios del diff también terminan sin errores. GitHub Actions repite instalación desde lockfile, fixture editorial, lint, pruebas, generación de tipos y build en un checkout limpio; su resultado remoto debe comprobarse en el PR.

El [informe de rendimiento](./performance-qa.md) conserva los resultados completos, incluida la nota baja de laboratorio y la advertencia de CPU del equipo. La reducción de código y trabajo de JavaScript está medida; la velocidad real de producción todavía no está aceptada. Una nota automática de SEO o accesibilidad no acredita posicionamiento ni sustituye las comprobaciones manuales.

La preview requiere una base Turso propia y configuración Auth independiente. El proyecto Vercel actual no tiene esas variables en Preview y comparte conexiones de Blob/cron con producción. [Estado observado y propuesta concreta](./preview-readiness.md). El inicializador preparado rechaza bases existentes y no crea cuentas ni se conecta por defecto: [guardas de QA remota](./remote-qa-initializer.md).

Los textos editoriales no se importan en producción como efecto de desplegar código. Su revisión y publicación conservan los slugs existentes. La distribución de 90 días sigue siendo trabajo editorial futuro, con copys y guiones ya preparados; no se presenta como una campaña ejecutada.

Las cifras y testimonios heredados de la web no han recibido una verificación comercial independiente. Los casos nuevos solo describen herramientas propias de Latech y no inventan clientes, resultados o porcentajes.

## Método de trabajo

Tres agentes repartieron juegos, contenido y arquitectura, con revisiones cruzadas y coordinación de la integración. Influyeron las guías `web-design-director`, `emil-design-eng`, movimiento, QA y revisión de código. La referencia de 21st.dev se consultó en su catálogo público: no se afirmó autenticación del CLI ni se instalaron sus componentes. Playwright comprobó recorridos reales, las pruebas de datos usaron SQLite aislado y Lighthouse midió el build local. GitHub y el CLI de Vercel se verificaron autenticados; Search Console y la analítica privada no estaban disponibles para establecer resultados de tráfico.
