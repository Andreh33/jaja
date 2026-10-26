# Revisión de rastreo e indexación — 26 de octubre de 2026

Auditoría HTTP de producción y revisión de los casos señalados por Google/Bing. Las respuestas actuales y los informes históricos se documentan por separado: una URL técnicamente indexable no equivale a una URL indexada.

## Resultado HTTP actual

El sitemap general servido durante esta revisión contiene **541 URLs únicas**, frente a las 533 observadas durante la entrega anterior. Se guardó el XML completo y se comprobaron las 541 URLs, sin limitarse al paquete internacional de 364.

- Las 541 responden HTTP 200, sin redirecciones y con canonical propio único.
- Ninguna lleva noindex en metadatos robots/googlebot/bingbot ni en X-Robots-Tag. Robots.txt permite su rastreo y anuncia ambos sitemaps; sus restricciones se limitan a áreas privadas.
- Todas tienen título, una H1 y descripción. No se encontraron títulos/descripciones duplicados ni la señal simple de soft 404 empleada por el auditor.
- Las 32 páginas sin entrada desde otra URL del sitemap se descubren mediante enlaces HTML normales de `/blog?page=2` a `/blog?page=11`. No se confirmó ninguna página huérfana al incluir esa paginación.
- La revisión no identifica una barrera global de rastreo/indexación. No sustituye las decisiones de calidad, canonical o indexación que cada buscador toma al procesar el contenido.

## Fallos concretos corregidos

Dos enlaces editoriales apuntaban a rutas inexistentes:

| Artículo | Destino antiguo | Destino real equivalente |
|---|---|---|
| estructura-de-una-pagina-de-servicios | /blog/crear-web-nueva-empresa-espana | /blog/crear-una-web-para-una-nueva-empresa-en-espana |
| medir-resultados-despues-de-estrenar-web | /prepara-tu-proyecto | /briefing |

Los dos destinos reales se comprobaron en producción con HTTP 200. Se corrigieron los href del contenido versionado y se añadieron redirecciones permanentes exactas para esas dos rutas antiguas. Así se conservan posibles referencias externas, HTML en caché o contenido CMS que todavía use los href anteriores, sin sobrescribir filas de producción.

El repositorio da prioridad a contenido CMS sobre los artículos versionados. Las credenciales locales son marcadores, por lo que no se ha inspeccionado ni modificado la base de datos de producción. Las redirecciones cubren ambas fuentes posibles de referencias antiguas.

Se añadió además un enlace contextual desde la guía de preparación de una empresa hacia el artículo existente sobre trabajar con una agencia a distancia. El párrafo ya trataba documentos, videollamadas y revisiones compartidas. No se reescribió el artículo original de destino.

Verificación: `npx tsx --test tests/campaign-internal-links.test.ts` pasó 3/3; ESLint de los archivos modificados y `npx tsc --noEmit` terminaron sin errores. El primer test reprodujo el href roto antes de aplicar la corrección. El build aislado con la base QA local y URLs de autenticación locales válidas terminó con exit 0; log: `.superpowers/indexing-review-build.log`. El primer intento había detectado una URL de entorno local marcada como placeholder y se repitió corrigiendo únicamente el entorno del proceso. Solo queda publicar y verificar las dos rutas antiguas con 308 y sus destinos con 200.

## Casos HTML de Google

Los cuatro documentos HTML del informe histórico «rastreada, actualmente sin indexar» responden ahora 200, con canonical propio y sin prohibición de indexación:

| Página | Enlaces entrantes desde otras páginas del sitemap | Descubrimiento adicional |
|---|---:|---|
| /blog/integrar-agente-ia-crm | 18 | blog, página 5 |
| /diseno-web/alicante | 3 | cobertura, Murcia y Valencia |
| /blog/trabajar-agencia-web-a-distancia | 0 antes del cambio | blog, página 5; nuevo enlace contextual en esta corrección |
| /blog/web-para-autonomos | 1 | blog, página 7 |

Las diez URLs HTML del informe histórico «descubierta, actualmente sin indexar» también están en el sitemap actual, responden 200, tienen canonical propio, no tienen noindex y reciben enlaces internos, incluyendo paginación cuando corresponde. Se guardaron los detalles de agencia/freelancer/DIY, agentes de clínicas y peluquerías, las categorías diseño web y tiendas online, Bizum, comercial remoto y las experiencias Capó/Escape/Lienzo.

Los 404 históricos `/mes`, `/pagina?id=4827`, `/manifest.webmanifest`, `/empleo/prueba` y `/diseno-web-restaurantes` siguen dando 404. No se encontró una equivalencia comercial que justifique redirigirlos. `/blog/pagina-web-restaurantes` es un artículo existente, no una sustitución automática de la antigua ruta comercial. No se redirigieron recursos JavaScript antiguos ni direcciones sin equivalente.

## Estado de los buscadores observado por el coordinador

El informe de Google actualizado el 19 de octubre es anterior a la expansión: 175 indexadas y 203 excluidas. De las 183 «rastreada, actualmente sin indexar», 179 son recursos JavaScript o imágenes OG y cuatro son los HTML examinados arriba. El noindex de `/login` y la canonical alternativa de `/briefing?decision=urls` son intencionales. No se han bloqueado scripts ni añadido noindex general a imágenes OG para reducir esos recuentos.

La inspección actual de Google confirma `/us` indexada, con rastreo del 26 de octubre, canonical propio y rastreo/indexación permitidos. `/latam` todavía figuraba desconocida, pero su prueba en vivo confirmó que está disponible y puede indexarse. La solicitud manual de `/latam` fue rechazada porque la cuota diaria de Google estaba superada; no fue un fallo de CAPTCHA y no se reintentó superar el límite. Evidencia: `google-manual-quota.txt/.png`.

Bing muestra `/us` descubierta y aún sin rastrear; su prueba en vivo indica que la URL puede indexarse. El aviso de una imagen sin alt corresponde a la capa decorativa del portfolio, que usa `aria-hidden="true"` y `alt=""` deliberadamente; se conservó esa semántica. Bing aceptó las solicitudes manuales de `/us` y `/latam`, mostrando para ambas «Indexing requested». Esta confirmación acredita la solicitud, no la indexación final.

La inspección actual de Alicante confirma el estado «rastreada, actualmente sin indexar», pero conserva una última lectura del 30 de junio a las 11:45. El rastreo, la respuesta y la indexación están permitidos, con canonical propio seleccionado por Google. El cuerpo local contiene 343 palabras, además de introducción, sectores y FAQ. Presenta casos de turismo de Costa Blanca, catálogo de calzado y clientes inmobiliarios extranjeros; no es una sustitución literal del nombre de ciudad. La mayor coincidencia con otra landing de diseño web es un 29% de sus secuencias de seis palabras (Málaga); Valencia comparte un 19%. Hay bloques de oferta comunes, pero esta comparación no demuestra que sean la causa de la exclusión ni justifica inventar hechos locales para forzar diferencias. Se priorizaron las correcciones objetivas de enlaces y el descubrimiento contextual.

La inspección actual de `/blog/web-para-autonomos` también confirma «rastreada, actualmente sin indexar», con última lectura del 30 de junio a las 06:07, indexación permitida y canonical propio. Su respuesta HTTP actual y sus enlaces se verificaron en esta revisión, sin encontrar bloqueo técnico.

La inspección de `/blog/integrar-agente-ia-crm` conserva «rastreada, actualmente sin indexar» y última lectura del 11 de agosto a las 03:39. Google indica recuperación correcta, indexación permitida y canonical propio. La página recibe 18 enlaces desde otras URLs del sitemap, además de la paginación; no se identificó una barrera de descubrimiento que justifique añadir enlaces indiscriminadamente.

La vista actual de Sitemaps en Google muestra ambos en estado Correcto y leídos el 26 de octubre: **541 URLs descubiertas en el principal y 364 en el internacional**, en consonancia con el XML auditado. Evidencia: `google-sitemaps-current.txt`. Descubiertas no significa indexadas.

Bing también confirma ambos sitemaps en estado Success: 541 URLs en el general y 364 en el internacional, con cero errores y cero avisos. Evidencia: `bing-sitemaps-current.txt/.png`. El paquete internacional forma parte del general; los recuentos no se suman como páginas únicas. El sitemap antiguo de www con 186 URLs no se eliminó: la variante www ya redirige de forma permanente al dominio principal.

No se reenviaron sitemaps ni IndexNow durante esta auditoría. La publicación y verificación HTTP de las correcciones corresponde al coordinador; la indexación completa sigue siendo una decisión asíncrona de Google/Bing.

## Evidencia

Carpeta: `H:/Proyectos/seo-20261012/evidence/latech-indexing-review-20261026`.

- `full-sitemap-http-audit.json`, `sitemap.xml`, `robots.txt`: 541 URLs, respuestas, metadatos, enlaces y resultados.
- `pagination-and-priority-audit.json`: paginación real y los cuatro HTML señalados.
- `google-discovered-current-http.json`: los diez casos «descubierta» actuales.
- `google-historic-404-http.json`: respuestas de las rutas históricas.
- Las exportaciones y capturas de consola guardadas por el coordinador documentan los estados históricos y las pruebas actuales.
