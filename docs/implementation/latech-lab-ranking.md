# Latech Lab y ranking Escape v2

Implementación local en la rama de evolución del 10 de septiembre de 2026. No implica un despliegue ni una migración de producción.

## Rutas y carga

- `/lab`: catálogo HTML con juegos, lienzo, explicaciones y acceso a Misterios. Destaca `/lab/trazo`, la experiencia de crear y compartir un recorrido desarrollada por el agente de juegos.
- `/lab/escape`, `/lab/runner`, `/lab/lienzo`, `/lab/capo`, `/lab/rayos-x`: descripción, instrucciones, datos/progreso, enlaces relacionados, canonical y tarjeta Open Graph propia.
- Los motores se importan mediante `next/dynamic` dentro de un componente cliente y solo se montan al pulsar el botón de apertura. Cerrar desmonta el experimento. El listado no ejecuta los motores.
- Las ilustraciones del listado son CSS/SVG originales. Se mantienen Syne, Geist, fondo `#07050E` y paleta violeta/naranja. La frase «Tu imaginación, nuestro límite.» permanece literal.
- El layout compartido de Lab incluye navegación y pie: las páginas descendientes no deben repetirlos.

Dirección visual: `web-design-director`, adaptación local de diseño y `emil-design-eng`. 21st CLI no autenticado; se consultó el catálogo público de Bento Grid de Manu Arora como referencia de jerarquía. No se instaló su componente ni sus dependencias. Se siguieron los documentos locales de Next 16.2.4 para rutas dinámicas, metadata y carga diferida.

## Contrato de ranking

`POST /api/escape-runs` con `{mode,difficulty}` devuelve 201 y `{runId,runToken,rulesVersion,expiresAt}`. Modos: `campana`/`infinito`; dificultades: `facil`/`normal`. La sesión comienza al iniciar una partida, no al terminarla.

`POST /api/escape-leaderboard` con `{runId,runToken,name,score,durationMs}` devuelve `{ok,duplicate,entry,top}`. El alias se elige antes de publicar y la publicación es opcional. Una sesión solo admite un resultado inmutable. Un reintento idéntico devuelve el ya aceptado; cambiar alias, puntuación o duración produce 409. La unicidad de `run_id` también resuelve peticiones simultáneas.

`GET /api/escape-leaderboard?mode=infinito&difficulty=facil` devuelve `{top,mode,difficulty,rulesVersion}`. Se separan modo, dificultad y versión de reglas. Orden: puntos descendentes, duración ascendente y fecha de registro ascendente, hasta 20 resultados. Todas las respuestas desactivan caché.

Estados: 400 entrada inválida, 401 credencial de sesión inválida, 403 origen no autorizado, 409 resultado distinto ya aceptado, 410 sesión caducada, 422 resultado fuera de límites, 429 límite de peticiones y 503 almacenamiento indisponible. Un fallo de almacenamiento no se presenta como una clasificación vacía o una publicación correcta.

## Límites y seguridad

- El servidor genera una credencial aleatoria de 32 bytes y almacena solo SHA-256. El token en claro se entrega una vez y el cliente lo conserva en memoria durante la partida; no se escribe en logs.
- Caducidad: 60 minutos; duración activa máxima: 30 minutos. La duración activa excluye intro y pausas y no puede exceder el tiempo del servidor en más de 2 segundos.
- Plausibilidad de puntos: `floor(durationMs / 1000 * 8) + 30`. Es una barrera contra resultados incoherentes; **no verifica un replay ni evita toda manipulación del cliente**. No es suficiente para una competición con premios.
- El limitador actual es por IP y proceso: no es distribuido ni persiste entre reinicios. Inicio: 12/min; publicación: 20/min. Se preserva el limitador existente, sin añadir servicios externos.
- Las sesiones caducan para publicar; un resultado ya guardado admite un reintento idéntico después de caducar para recuperar respuestas perdidas. Los datos no se borran automáticamente. La retención y la moderación del ranking deben acordarse antes de escalarlo.
- Si el inicio no obtiene sesión, el juego permite una partida con récord local. Crear una sesión al finalizar daría una duración de servidor incorrecta y se evita. La disponibilidad del ranking depende de configurar su base de datos.

## Preparación del esquema

Las tablas nuevas son `escape_runs` y `escape_results`. La tabla antigua `escape_scores` no se toca ni sus resultados se mezclan con v2. Las rutas API no crean tablas al recibir tráfico.

SQL aditivo revisable: `scripts/sql/escape-ranking-v2.sql`. Definición equivalente en `drizzle/schema.ts`.

Para preparar exclusivamente el fichero local de QA:

```sh
./node_modules/.bin/tsx scripts/prepare-escape-ranking.ts file:.local/qa.db
```

El script ignora las variables de credenciales y rechaza destinos que no empiecen por `file:`. Sin argumento utiliza `.local/qa.db`. No ejecutar `db:push` como sustituto de revisar este cambio aditivo. Una base de preview/producción necesita un destino y una migración explícitos; esta entrega no los ha creado.

## Evidencia

`./node_modules/.bin/tsx --test tests/escape-ranking.test.ts`: 7/7 pruebas aprobadas en SQLite en memoria con el SQL real y el adaptador real. Cubren hash, categorías, credenciales incorrectas, expiración, plausibilidad, idempotencia, concurrencia, recuperación tras respuesta fallida, separación de rankings y conservación de datos legacy.

ESLint focalizado en rutas Lab, endpoints, helpers, script, pruebas y esquema: exit 0. `git diff --check` focalizado: limpio. Las pruebas globales y la comprobación de navegador pertenecen a la entrega coordinada; este documento no afirma resultados de esas comprobaciones.

Smoke HTTP real contra `http://localhost:3010`, con tablas en `.local/qa.db`: aprobado. Verifica 403 sin origen, 400 categoría inválida, 201 al crear sesión, 401 token incorrecto, tres envíos simultáneos con una sola aceptación y dos duplicados, 409 al cambiar el resultado y GET 200 por categoría. Las respuestas comprobadas incluyen `Cache-Control: no-store`. Script reproducible: `./node_modules/.bin/tsx scripts/smoke-escape-ranking.ts` (solo destinos loopback; escribe un resultado de QA local).

En este servidor Next de desarrollo, acceder mediante `127.0.0.1` reconstruye `request.url` con origen `localhost` y la guarda rechaza ese POST con 403. La QA se realiza con `localhost:3010`; no se ha debilitado la comprobación de origen. El comportamiento en un preview real debe comprobarse allí, sin extrapolar esta diferencia local a producción.
