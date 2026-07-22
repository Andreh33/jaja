# Recuperación SEO local basada en Search Console — diseño

**Fecha:** 2026-07-22  
**Sitio:** https://serviciosonlineweb.com  
**Rama:** `codex/seo-2026-07-22-latech`

## Situación observada

En Google Search Console, el periodo 7–20 de julio registra 0 clics y 332 impresiones frente a 5 clics y 54 impresiones en el periodo anterior. El CTR cayó de 9,3 % a 0 % y la posición media pasó de 28,3 a 75,4. El crecimiento de impresiones procede sobre todo de las landings de diseño web en Badajoz y Bilbao, ambas con 92 impresiones y ningún clic.

El rastreo público comprobó 143 de 143 URLs con HTTP 200 y un H1, 140 canonicals exactos y 458 bloques JSON-LD válidos. Search Console muestra 64 URLs indexadas y 35 rastreadas sin indexar. El sitemap enviado en Google aún reflejaba 137 URLs aunque producción ya ofrece 143. Las páginas de términos y privacidad carecen de canonical propio.

## Objetivo

Recuperar clics y mejorar la elegibilidad de indexación sin ampliar el inventario programático. Se priorizan Badajoz y Bilbao porque Google ya las está probando y porque representan intención comercial directa.

## Diseño aprobado

1. Reposicionar los fragmentos de Badajoz y Bilbao alrededor de la consulta real, un precio verificable desde 600 €, entrega 24–48 h y ausencia de permanencia.
2. Mantener la transparencia de que Bilbao se atiende en remoto y reforzar en Badajoz la cercanía real desde Puebla de la Calzada; no fingir oficinas locales.
3. Añadir fecha de actualización por landing y hacer que el sitemap use esa fecha solo para las páginas modificadas.
4. Añadir canonical autorreferente a términos y privacidad.
5. Crear pruebas para títulos, descripciones, precio, transparencia geográfica, fecha de actualización y canonicals.
6. Validar unicidad de landings para impedir duplicación y canibalización.
7. No publicar más artículos ni más ciudades en esta entrega: la prioridad es calidad, indexación y conversión de lo existente.

## Restricciones

- Trabajo exclusivo en Linux remoto por SSH.
- No tocar Vercel.
- No mezclar el enorme conjunto de cambios sin confirmar del directorio principal.
- Consultar la documentación instalada de Next.js 16 antes de modificar metadata o sitemap.
- No inventar oficinas, testimonios, premios, perfiles sociales ni resultados.
- Publicar únicamente el commit aislado mediante GitHub.

## Verificación y publicación

Se ejecutarán las pruebas existentes, las nuevas pruebas SEO, el validador de unicidad, ESLint sobre los archivos modificados y `next build`. Los nueve errores globales de ESLint existentes quedan registrados como línea base y no se atribuirán a este trabajo. Tras el despliegue se comprobarán las dos landings, sitemap, canonicals y JSON-LD, y se enviarán las URLs a IndexNow y el sitemap a Google/Bing.
