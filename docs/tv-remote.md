# Latech TV · mando temporal

## Comportamiento

- El ordenador crea un QR de un solo uso, válido durante dos minutos.
- Al abrirlo, el móvil se conecta automáticamente. No hay aprobación adicional.
- Un único móvil por sesión. La conexión dura como máximo veinte minutos.
- El mando cambia entre Studio y los proyectos permitidos, amplía/reduce la pantalla, desplaza la landing y salta a inicio, proyectos, laboratorio o contacto.
- No ejecuta JavaScript, URLs, clics arbitrarios, formularios, compras ni navegación sobre sitios externos. La interacción dentro de proyectos sigue confinada a su origen mediante el shell CSP existente.
- La tele aplica y confirma cada orden; el móvil distingue señal pendiente de canal realmente mostrado. Pérdida de red, pestaña en pausa, caducidad y desconexión tienen estados explícitos.

## Seguridad y datos

- Secretos aleatorios de 256 bits, diferentes para anfitrión, invitación y mando. Solo se guardan sus hashes.
- La invitación viaja en el fragmento del enlace, que se elimina al abrir el mando. No viaja en query strings, analítica ni Referer.
- El mando conserva su credencial en sessionStorage, no localStorage. Recargar el ordenador termina su disponibilidad: hay que generar otro QR.
- Emparejamiento y órdenes se serializan en transacciones de la base compartida; no dependen de memoria de una instancia serverless.
- Creaciones limitadas persistentemente por HMAC de IP: seis por diez minutos y veinte por día. Existe además un límite global de 150 sesiones vivas y una defensa adicional en memoria para peticiones repetidas.
- El CRM `/admin/mandos` exige ADMIN antes de consultar. Nunca consulta ni muestra hashes, credenciales ni IPs en claro.
- Datos: fecha, última señal, navegador/versión mayor, sistema, clase de dispositivo, ciudad/país aproximados cuando Vercel los proporciona, canal y número de órdenes. Identidad solo si el móvil ya tenía una sesión de usuario válida; si no, visitante anónimo. No GPS, fingerprinting ni identificación inferida.
- Retención de registros de 30 días; HMAC de IP como máximo 24 horas más el margen del cron diario; credenciales inservibles desde la caducidad, purgadas después. Limpieza tanto al crear sesiones como en el cron existente (sin alterar su lógica de candidaturas).
- El sondeo existe únicamente con una sesión abierta, sin servicio de terceros nuevo. Tele ~900 ms, mando ~1600 ms; las pestañas ocultas/red desconectada se ponen en pausa. No se promete latencia de juego en tiempo real.

## Canales

Fuente única del catálogo: `src/lib/projects.ts`. Lista permitida: `src/lib/tv-channels.ts`.
Comprobación HTTP 2026-09-27: Zona Sport, Industrial Fighters y Maison Noir envían X-Frame-Options SAMEORIGIN. Se excluyen de la TV, pero se conservan en el portfolio público. Los once canales restantes cargaron contenido legible dentro de su iframe real en Chromium durante QA. Una política externa puede cambiar; no debe sortearse con un proxy.

## Activación del almacenamiento

La fuente de verdad es `drizzle/schema.ts`. El entrypoint `drizzle/tv-remote-scope.ts` reexporta las tablas aisladas del mando y del arcade. Con `TV_REMOTE_SCHEMA_ONLY=1`, la configuración limita schema y tablesFilter a `tv_remote_sessions` y `tv_arcade_sessions`.

Ejecutar **solo con autorización del entorno destino** `TV_REMOTE_SCHEMA_ONLY=1 npm run db:push`. Se mantienen los guardarraíles de índices y operaciones destructivas. El plan permitido únicamente crea las dos tablas y sus cinco índices; nunca debe recrear otras tablas. No saltarse las protecciones.

La migración global sobre la fixture local detectó drift destructivo preexistente en otras tablas y fue bloqueada. La migración acotada pasó ambos guardarraíles en local y, tras autorización explícita del usuario el 27/09/2026, en producción. El hash de las 41 estructuras preexistentes permanece idéntico.

## Diseño y dependencias

Mando propio en HTML/CSS: carcasa gris envejecida, tornillo, receptor, LCD verdoso, botones de goma y teclas de colores. Usa la textura de ABS desgastado generada con ImageGen en `public/arcade/worn-plastic.webp`, además de imágenes de marca y proyectos. El QR se calcula con `qrcode` 1.5.4 (MIT, soldair/node-qrcode), nunca con generación de imágenes. El canal secreto y los gamepads se documentan en `docs/arcade.md`.

21st CLI no autenticado; se consultó [Interactive Selector, Le Thanh](https://21st.dev/@minhxthanh/components/interactive-selector) como referencia de selección visual. No se instaló su código ni se asumió licencia. Se conservan Next/React, CSS Modules y Radix Dialog existentes.

La revisión de movimiento aplica las guías animate y Emil: feedback breve, curvas explícitas, apertura modal 240 ms, teclado inmediato, reduced motion y hover restringido a puntero fino.

| Antes de revisión | Después | Motivo |
| --- | --- | --- |
| Guía animada también desde teclado | Apertura instantánea desde teclado | Respuesta inmediata |
| Filtro animado en botones | Solo transform para el desplazamiento del botón | Evitar repintados innecesarios |
| Tres pestañas que no escalan a once | Guía visual y selector nativo compacto | No recortar proyectos en móvil |

## Validación

Pruebas automatizadas en `tests/tv-remote.test.ts`: hash, roles, claim único/concurrente, retry idempotente, ack obsoleto, allowlist, caducidad, desconexión, límites persistentes y metadatos. `npx tsx scripts/qa-tv-remote.ts` pasó contra build local de producción: origen, tamaño, emparejamiento, roles, allowlist, confirmación de órdenes, desconexión y redirección del CRM sin autenticación. QA visual en escritorio y móvil emulado; no se ha probado un móvil físico.
