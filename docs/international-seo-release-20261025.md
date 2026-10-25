# Latech internacional — 25 de octubre de 2026

## Alcance
Español existente más inglés `/en`, francés `/fr`, alemán `/de`, portugués `/pt` e italiano `/it`. Nueve artículos por idioma: 54 piezas originales de unas 650–720 palabras, organizadas por los mismos nueve temas editoriales. Cada idioma adicional tiene inicio, catálogo de servicios, tres servicios, estudio, portfolio, contacto y blog: 90 URLs nuevas; se añaden nueve artículos españoles y se actualizan nueve páginas españolas equivalentes. El paquete verificado contiene 108 URLs.

Los contactos usan el WhatsApp actual de Latech con mensajes localizados y contexto del artículo/servicio. La medición conserva idioma y página pública sin almacenar consultas o mensajes privados; un clic no equivale a una venta. El negocio mantiene su sede real en España y explica el servicio remoto. No se añaden oficinas ficticias ni promesas de disponibilidad o posiciones.

## SEO y publicación
HTML estático con idioma correcto desde servidor; canonical propio; hreflang recíproco con seis idiomas y x-default; metadatos sociales y tarjetas localizadas; datos estructurados de páginas, servicios, artículos y breadcrumbs; selector de idioma con equivalencias; enlaces entre artículos y servicios; 404 para rutas inexistentes. Las URLs españolas permanecen iguales aunque su código se agrupa bajo `(es)` para admitir layouts raíz por idioma.

Sitemap principal: https://serviciosonlineweb.com/sitemap.xml

Sitemap del paquete: https://serviciosonlineweb.com/sitemap-international.xml

Robots declara ambos. El azul base pasa de #030914 a #06101f; el acento eléctrico de #3985ff a #5599ff. Se conserva el sistema visual oscuro.

## Verificación previa
- Producción inicial y GitHub main: `376adf2ddf5aa72df2070a26ccd99d83014f45ef`.
- Build Next.js: correcto; 318 páginas estáticas generadas, incluidas las 90 internacionales. TypeScript y ESLint correctos.
- Pruebas focalizadas de internacionalización, medición, autenticación, SEO local y movimiento: 21/21 correctas.
- Auditoría HTTP de las 108 URLs: cero fallos de estado, idioma, canonical, hreflang, WhatsApp, H1 y sitemap; rutas desconocidas responden 404.
- Revisión visual de francés en escritorio/móvil, artículo alemán largo y navegación española en móvil. Corregidos la columna y los eventos del selector; cambio efectivo de español a francés comprobado.
- Revisión independiente de contenido y código. Detector visual: cero avisos en las nuevas superficies; avisos de estilos anteriores conservados por identidad y alcance.
- Suite completa: 294/309 correctas; 15 fallos en tres fixtures previos de SQLite por `EPERM` al limpiar directorios temporales en Windows. Reproducidos también con el runtime Node incluido; esos fixtures no se modifican en esta entrega. Las pruebas ajenas a esos tres archivos se ejecutan por separado para aislar la limitación del entorno.

## Buscadores
La solicitud del usuario autoriza publicación y envío a Google, Bing y otros buscadores disponibles. Se enviarán las URLs públicas verificadas y los sitemaps, conservando los recibos en `.local` y en la evidencia del proyecto. Recibido/enviado no significa indexado: cada buscador decide el rastreo y la inclusión. No se repetirá automáticamente una solicitud que ya tenga recibo.

Referencia técnica: [Google Search Central: versiones localizadas](https://developers.google.com/search/docs/specialty/international/localized-versions), [sitios multilingües](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites), [IndexNow](https://www.indexnow.org/documentation).

## Estado final
Pendiente de registrar despliegue y respuestas de los buscadores tras la verificación pública.
