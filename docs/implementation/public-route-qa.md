# QA HTTP de rutas públicas · localhost

Revisión independiente, 10 de septiembre de 2026. Todas las solicitudes son GET a `http://localhost:3010`, con un máximo de dos simultáneas. El rastreador sustituye el origen del sitemap y rechaza redirecciones fuera de ese host y puerto. No abre navegador ni solicita producción. Se excluyen slugs `qa-editor-*`, que otra prueba crea y retira durante la revisión.

## Resultado final: build 4

Pasada del 10-09-2026, 07:19:25–07:20:00 UTC. Build ID `OhckJZZgspYWH4mXArmEx`, comprobado antes y después: no cambió durante la revisión. **Cero hallazgos dentro del alcance HTTP descrito.**

| Comprobación | Resultado |
| --- | --- |
| URLs públicas del sitemap | 159, todas HTTP 200 |
| Artículos de la fixture local | 82, incluidas las 14 piezas editoriales |
| Título, H1 y canonical de cada URL del sitemap | Uno no vacío de cada tipo; canonical con origen/ruta esperados |
| Duplicados entre páginas | Sin títulos ni H1 repetidos |
| Indexación pública | Ninguna URL del sitemap incluye noindex |
| Enlaces internos del Lab | 439 referencias hacia 39 destinos; estado y fragmentos correctos |
| Destino enlazado adicional fuera del sitemap | `/login`, HTTP 200; no se exige canonical de página indexable |
| Imágenes Open Graph | 24, HTTP 200, `image/png`, 1200 × 630 |
| Borrador fijo, su OG y artículo inexistente | HTTP 404; respuestas HTML con noindex |
| Borrador en sitemap | Ausente |
| robots.txt | HTTP 200; exclusiones `/admin`, `/dashboard`, `/api` y sitemap público correcto |

Las 24 OG incluyen las diez de Lab/Misterios/Trazo/Briefing/calculadora y las catorce de las piezas editoriales. El borrador comprobado es `qa-private-draft`; la URL inexistente es `qa-http-nonexistent-post`. No aparecieron URLs temporales `qa-editor-*` en esta pasada.

Evidencia completa ignorada por Git: `.local/public-route-qa.json`. El rastreador se conserva versionado en `scripts/qa-public-routes.py`. Se revisaron los campos HTML recibidos por HTTP y los bytes de las imágenes, sin atribuir al rastreo una validación visual o interactiva.

Los cambios posteriores del build 5 afectan al contraste de `AuthorBio`, la pausa de Marquee y las cookies de respuesta del guard de `/admin`/`/dashboard`. No alteran las URLs públicas, títulos/H1/canonical ni generación OG que cubre esta pasada; sus comprobaciones visuales y de logout se registran por separado. El informe conserva el build ID realmente rastreado y no atribuye una nueva ejecución completa al build posterior.

Build 5 compilado después: `EXwr7f1qR5891HUKhrLTQ`, comprobado en `.next/BUILD_ID`; raíz reporta build/TypeScript correctos y 192 rutas estáticas. En el momento de actualizar este informe seguían pendientes las comprobaciones focales de interfaz/logout, que corresponden al coordinador. El SHA del commit de entrega se registra cuando exista; un build ID no lo sustituye.

## Reproducir

Desde la raíz del repositorio, con Python 3 estándar, fixture QA preparada con `npm run qa:prepare -- --editorial-preview` y el build de producción correspondiente sirviéndose en `localhost:3010`:

```sh
python3 scripts/qa-public-routes.py
```

No requiere paquetes Python. Guarda el JSON en `.local/public-route-qa.json`, crea ese directorio si hace falta y registra el build ID de `.next/BUILD_ID`; detecta si cambia durante la pasada. El destino es fijo y solo usa GET locales, hasta dos simultáneos. La fixture editorial se prepara por separado y solo en la base local; el rastreador no escribe datos de la aplicación. No ejecutarlo junto a Lighthouse.

## Fixture y primera pasada conservada

La fixture inicial contenía 60 artículos y la primera pasada cubrió 137 rutas y diez OG sin hallazgos. Su evidencia queda separada en `.local/public-route-qa-baseline-60-posts.json`.

Se completaron 76 históricos extrayendo por AST los 16 artículos inline de `seed.ts`, sin importar ni ejecutar ese archivo. La comparación de 76 slugs con el inventario es exacta. Después se aplicó la opción editorial explícita: ocho reemplazos y seis altas para llegar a 82, preservando IDs/fechas existentes y sin tocar cuentas/pedidos/contactos/rankings. Quince pruebas focales y la integración CLI local verifican esa preparación. La pasada final sí cubre la fixture 82 sobre el build correspondiente; no hay publicación editorial en producción.
