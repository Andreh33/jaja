# Portfolio y canales de clientes — 2 octubre 2026

## Objetivo y decisiones

Añadir FullDip Sur, Granja Orea/Orea Camp, F5 Arquitectos, Quality Homes CR y Frutas Megías a `/proyectos`, Studio, la guía de televisión y el mando móvil. El usuario pidió después permitir la navegación real dentro de la tele y trabajar de una en una, sin muchos agentes simultáneos.

Los tres agentes iniciales terminaron su investigación/capturas y cerraron sus navegadores. No se abrirán nuevos agentes para este trabajo. Las comprobaciones pesadas se ejecutan en serie.

## Trabajo local

- Fuente compartida: `src/lib/projects.ts`. Cinco proyectos al principio del portfolio, con descripción respaldada por sus repositorios, servicios y captura real optimizada.
- `src/lib/tv-channels.ts` mantiene el orden de los canales existentes. Nuevos canales: 13 FullDip, 14 Orea, 15 F5, 16 Quality Homes, 17 Frutas Megías. Total: 19 proyectos, 16 proyectos en TV y 18 canales contando Studio y Teletexto.
- `src/components/home/crt-channel.ts` corrige la numeración de la pantalla para coincidir con guía y mando, incluyendo índices inválidos.
- `src/app/proyectos/page.tsx` muestra servicios y número de canal para las nuevas fichas.
- Capturas PNG reales de 1440×900 en `output/playwright/portfolio-2026-10-02/`; assets públicos WebP en `public/proyectos/`, 434316 bytes en total. Revisadas visualmente por los agentes.
- La alternativa provisional de presentación estática se retiró tras la instrucción del usuario: los cinco canales usan el navegador real existente.

## Destinos comprobados

| Canal | Marca | URL | Cabeceras públicas antes del cambio |
| --- | --- | --- | --- |
| 13 | FullDip Sur | https://fulldip-sur.vercel.app/ | SAMEORIGIN |
| 14 | Granja Orea · Orea Camp | https://www.oreacamp.com/ | DENY y frame-ancestors none |
| 15 | F5 Arquitectos | https://www.f5arquitectos.com/ | SAMEORIGIN |
| 16 | Quality Homes CR | https://www.qualityhomescr.es/ | DENY |
| 17 | Frutas Megías | https://megias-fruta.vercel.app/ | Sin restricción de marcos |

Las cinco URLs respondieron 200 durante la investigación. FullDip usa el alias del rediseño: fulldipsur.com todavía presenta la tienda anterior. No se anuncian pagos activos ni el recorrido desactivado de F5.

## Permiso de incrustación preparado

Política pública exacta: `frame-ancestors 'self' https://serviciosonlineweb.com https://www.serviciosonlineweb.com`. No se permiten orígenes comodín ni se modifica el sandbox de LATECH.

- `/home/andreh/fulldip-sur/next.config.ts`: política pública; `/admin`, `/api`, `/carrito` y `/checkout` conservan CSP none y XFO DENY.
- `/home/andreh/granja-orea/next.config.ts`, `src/proxy.ts`, `tests/unit/proxy.test.ts`: política por defecto cerrada, excepción solo para páginas públicas conocidas. Mantiene nonce, aislamiento de descargas y bloqueo de rutas operativas/desconocidas. No cambia datos, permisos de usuarios ni archivos.
- `/home/andreh/Documents/Codex/2026-09-10/ho/outputs/estudio-arquitectura-web/next.config.ts`: excepción pública, administración/API bloqueadas.
- `/home/andreh/qualityhomes-redesign/next.config.ts`: excepción pública, CRM/administración/API bloqueados.
- Megías no necesita modificación.

## Evidencia de validación

- FullDip: typecheck y lint del config pasan. Ocho rutas comprobadas con el resolutor de cabeceras de Next, incluyendo compra/admin/API. Cabecera pública comprobada también por HTTP local. La compilación local de `/admin` excedió 90 segundos por carga del equipo; se sustituyó por la comprobación del resolutor, no se afirma validación de esa página por HTTP.
- Orea: Biome en los tres archivos y 20 pruebas de `proxy.test.ts` pasan; casos públicos, operativos, desconocidos y descargas. Se verifican nonce y strict-dynamic existentes.
- F5: lint del config y siete rutas del resolutor de cabeceras pasan.
- Quality Homes: typecheck y ocho rutas del resolutor de cabeceras pasan.
- LATECH: lint pasa excluyendo artefactos generados `.next-qa/**` y `output/**`; typecheck pasa; suite completa con `--test-concurrency=1`: **293 pruebas, 0 fallos**. Build aislado webpack, cpus1 y base QA local completado: 193 páginas generadas.
- Revisión final del diff por root siguiendo `review-code-high-signal`: sin defectos adicionales verificados. Sin nuevas dependencias ni cambios en autenticación, datos o comercio.

## Estado y publicación

Publicación Git autorizada por el usuario, con commits independientes. GitHub conector y CLI verificados como Andreh33, ID 119471787; autor/committer con el correo privado autorizado. Se preservan todos los cambios ajenos y documentos anteriores.

- FullDip: `6ed54a8`, publicado y despliegue Vercel correcto; cabecera pública comprobada por HTTPS.
- Granja Orea: `d17d0f9`, publicado y despliegue Vercel correcto; cabecera pública comprobada por HTTPS.
- F5: `4016b0e`, publicado y despliegue Vercel correcto. Se incorporaron antes mediante avance rápido los dos commits remotos nuevos de SEO y analítica, sin sobrescribirlos.
- Quality Homes: `b978006`, publicado; despliegue Vercel correcto.
- LATECH: cambios listos para commit después de QA local. La navegación de los cinco canales en producción se comprobará tras desplegar el portfolio.

QA visual local: 19 fichas, sin imágenes rotas cargadas y sin desbordamiento horizontal a 1440 y 390 px. La guía muestra 18 canales, con los cinco nuevos en 13–17. Capturas de portfolio y guía móvil en `output/playwright/portfolio-2026-10-02/latech-*.png`. La consola local solo presentó el 404 esperado del script Vercel Analytics sin hosting Vercel y avisos de CSS precargado; sin errores React observados. Las capturas de página completa no fuerzan la carga de las imágenes perezosas de proyectos antiguos fuera de pantalla.

La política remota solo permite el dominio de producción de LATECH, por lo que la navegación externa de los cuatro clientes protegidos no se prueba desde localhost. No se amplía la lista de orígenes para QA.

## Skills y referencias

`web-design-director`, `emil-design-eng`, `agency-web-qa-deploy`, `playwright`, `review-code-high-signal` y `preserve-task-continuity`. 21st CLI sin sesión: se consultó [RetroDvdTv de Rahil Vahora](https://21st.dev/@rahil1202/components/retro-dvd-tv) como referencia de pantalla y controles; se conserva la tele existente y no se instala código de terceros. No se introducen animaciones nuevas.
