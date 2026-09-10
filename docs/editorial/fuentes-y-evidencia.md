# Fuentes y evidencia editorial

Consulta realizada el 10 de septiembre de 2026. Las piezas enlazan fuentes primarias junto a los hechos que respaldan. Las recomendaciones prácticas, ejemplos y estructura son originales; no se reproducen artículos de terceros ni se trasladan métricas de otras empresas a Latech.

## Fuentes externas contrastadas

| Fuente oficial | Uso acotado |
| --- | --- |
| [Google: operador site:](https://developers.google.com/search/docs/monitor-debug/search-operators/all-search-site) | No es un inventario exhaustivo; no aparecer no prueba que una URL no esté indexada |
| [Google: Inspección de URLs](https://support.google.com/webmasters/answer/9012289) | Diferencia entre informe indexado y prueba en directo; esta no garantiza indexación |
| [Google: migraciones con cambio de URLs](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) | Inventario, correspondencia de direcciones y redirecciones comprobadas |
| [Google: URLs de comercio electrónico](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites) | Coherencia de referencias, variantes y enlaces rastreables |
| [Google: resultados de producto](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) | Marcado acorde con el producto y ausencia de garantía de presentación enriquecida |
| [web.dev: Web Vitals](https://web.dev/articles/vitals) | LCP/INP/CLS y umbrales p 75; distinguir métricas de una afirmación sobre ventas |
| [WordPress: Plugin Handbook](https://developer.wordpress.org/plugins/) | Existencia de desarrollo de plugins propios |
| [WordPress: REST API](https://developer.wordpress.org/rest-api/) | Uso del contenido de WordPress desde interfaces o aplicaciones propias |
| [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) | Separación de renderizado del servidor e interacción del navegador; sin prometer resultados automáticos |

No se han incluido tarifas de proveedores externos, salarios, comparativas de cuota de mercado ni obligaciones fiscales o sanitarias sin documentación específica. IVA no incluido describe la oferta aprobada para estos presupuestos; no es una recomendación tributaria ni asigna un tipo impositivo al lector.

## Evidencia propia

| Evidencia | Qué permite afirmar | Qué no permite afirmar |
| --- | --- | --- |
| `src/lib/quotes/catalog.ts` y calculadora `_lib/state.ts` | Precios de referencia, cálculos, carácter orientativo y opciones actuales | Que cualquier proyecto o consumo esté incluido |
| Versión HEAD anterior de `_lib/state.ts` y `_components/Steps.tsx` | Nueve pasos previos, campos de cuenta y salida al checkout | Que todos los visitantes abandonasen por esa causa |
| `tests/quote-calculator.test.ts` | Combinaciones, límites, mensaje y persistencia probados en la revisión | Aumento de contactos o validación visual completa |
| `src/lib/trace-game/*` y `tests/trace-game.test.ts` | Dieciséis alturas, token versionado, generación y casos de física probados | Viralidad, universalidad entre todas las versiones futuras o destreza del usuario |
| `src/lib/lab-mysteries.ts` y pantallas de Misterios | Tres escenarios ficticios, corrección observable y artículos relacionados | Datos de reservas, ventas o negocios reales |
| `src/lib/briefing.ts` y `BriefingClient.tsx` | Tres tipos, reglas, guardado optativo, exportación y control de copia entre pestañas | Sincronización con cuentas, integración automática o contratación |
| `seo-evidence/crawl.json` y `parsed.json` de la auditoría | Inventario público 143 URLs, 76 artículos y estructura observada | Indexación completa, tráfico, ranking o revisión factual de cada frase |

La evidencia de auditoría está en `/home/andreh/Documents/latech-audit-2026-09-10/seo-evidence/`. Los informes de implementación están en `docs/implementation/`. El contenido público no debe exponer rutas locales, datos privados o nombres internos de herramientas de trabajo.

## Revisión previa a publicación

Confirmar que las rutas de experiencias corresponden a la entrega publicada; repetir las comprobaciones funcionales pertinentes si el código cambia. Los casos mencionan pruebas de reglas y separan expresamente QA visual e impacto comercial. Añadir capturas propias solo cuando exista una imagen de la versión validada, con texto alternativo descriptivo. No suplir una captura pendiente con una imagen inventada de resultados.
