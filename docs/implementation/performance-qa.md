# QA de rendimiento local

10 de septiembre de 2026. Lighthouse CLI sobre Next en modo producción en `http://localhost:3010`. Las ejecuciones y el navegador los gestiona raíz; este análisis lee los informes, los bundles descargados y el código. No representa una medición en Vercel ni datos de usuarios reales. **El rendimiento queda pendiente de aceptación externa: no se ha demostrado una mejora de LCP.**

## Portada: build 2 frente a build 3

| Métrica | Build 2 · 06:54 UTC | Build 3 · 07:06 UTC |
| --- | ---: | ---: |
| Lighthouse rendimiento | 54 | 41 |
| Accesibilidad automatizada | 94 | 100 |
| Buenas prácticas | 96 | 96 |
| SEO automatizado | 92 | 100 |
| FCP simulado | 2.54 s | 2.77 s |
| LCP simulado | 3.22 s | 5.50 s |
| LCP observado en la traza local | 2.35 s | 2.65 s |
| TBT simulado | 5556 ms | 4244 ms |
| Speed Index simulado | 6.38 s | 5.91 s |
| CLS | 0 | 0 |
| Trabajo total de hilo principal estimado | 19.73 s | 15.53 s |
| Trabajo de tareas observado por diagnostics | 4.93 s | 3.88 s |
| Evaluación JavaScript estimada | 6.95 s | 4.72 s |
| Estilos/layout estimados | 5.13 s | 4.91 s |
| Solicitudes totales | 38 | 31 |
| Solicitudes de scripts | 21 | 17 |
| JS transferido según network-requests | 293067 B | 258517 B |
| JS sin comprimir | 933061 B | 835765 B |
| Transferencia total | 453943 B | 415281 B |
| GET de sesión de Auth.js | 2 | 0 |
| Elementos del DOM final | 1136 | 883 |
| Profundidad máxima del DOM | 19 | 14 |
| benchmarkIndex de CPU local | 305.5 | 399 |

La reducción concreta de red es 34550 B de JS transferido (11.8 %) y 97296 B sin comprimir (10.4 %). El informe registra menor TBT y trabajo de JavaScript; la variación de CPU impide atribuir toda esa diferencia a un cambio aislado. El LCP empeora en ambas medidas, con una divergencia mayor en la estimación simulada. No se sustituye la puntuación 41 por 54 ni por el LCP observado.

Ambas ejecuciones usan simulación móvil, viewport 412 × 823 y multiplicador CPU 4. Ambas incluyen la advertencia de que la CPU local es más lenta de lo esperado por Lighthouse. La repetición de la portada sobre el servidor ya caliente se justifica por esa advertencia y por la discrepancia entre LCP observado/simulado. Se conservarán todos los resultados; no se ajustará el multiplicador para obtener otra puntuación. No mezclar carga de crawler/build con la medición.

## Qué cambios se verifican en red y código

- Los tres módulos de demos cerradas ya no se descargan al entrar: los scripts solicitados por build 3 no contienen los controles de Escape, Capó o Rayos X. Se cargarán al abrir la experiencia. El build anterior tampoco ejecutaba el motor Escape mientras estaba cerrado: el coste eliminado es su carga/evaluación inicial.
- No se solicitan sesiones de Auth.js en la portada y los chunks descargados ya no contienen SessionProvider/getSession. Los controles `auth()` del servidor permanecen; login/logout/editor requieren su smoke independiente.
- Las cifras constantes se representan como texto y desaparece el shadow DOM de NumberFlow de estas secciones. Reveal usa mediciones de IO; Breathe/WordPress comparten trabajo de scroll solo en escritorio visible. El informe no permite repartir exactamente el ahorro entre estos cambios.
- Los antiguos puntos concretos de reflow atribuibles a Toaster y mediciones Motion ya no aparecen. Queda un reflow de 746 ms sin atribución a una función concreta; su ausencia de fuente no demuestra que haya desaparecido todo trabajo forzado.

## LCP y trabajo restante

El LCP sigue siendo el párrafo descriptivo del hero. Aunque conserva la clase `hero-enter`, el CSS móvil la anula con `animation: none`, `opacity: 1` y `transform: none`; no se ha encontrado una espera de animación en ese elemento a 412 px. El desglose local del build 3 es 763 ms hasta primer byte y 1886 ms de retraso de render. La tarea larga atribuida al documento ronda 1818 ms simulados. Estos datos sitúan trabajo en renderizado/layout, pero el JSON disponible no identifica una regla CSS o componente que explique por sí solo esa tarea. No se cambian fuentes tipográficas o composición por una atribución supuesta.

Hay trabajo evitable adicional confirmado: el informe marca animaciones no compositadas fuera del hero en tres textos con `gradient-shift`/`background-position-x` y en el borde de estadísticas con `--beam-angle`. El CSS móvil solo detiene ese gradiente dentro del hero. Se comunicó a raíz la opción de dejarlos estáticos en móvil conservando colores; no se les atribuye la tarea completa de 1.8 s ni se promete una mejora cuantificada.

La página conserva CSS global, blur en superficies y contenido largo que requieren estilos/layout. Se necesitan una traza detallada y una medición en la preview Vercel real para distinguir el coste de la composición del entorno local. Cualquier nuevo ajuste debe repetirse con el mismo protocolo y revisar visual, teclado y movimiento reducido.

## Repetición sobre build 4 y servidor caliente

Ejecución de las 07:14 UTC, conservada en `output/performance/home-mobile-build4.report.json` y `.html`. Incluye un cambio acotado de código: los gradientes de texto y el borde beam son estáticos en móvil. Por ello es una tercera observación documentada, no una repetición idéntica del build 3.

| Métrica | Build 4 |
| --- | ---: |
| Rendimiento / accesibilidad / buenas prácticas / SEO | 51 / 100 / 96 / 100 |
| FCP simulado | 2.76 s |
| LCP simulado / observado | 3.98 s / 1.92 s |
| TBT simulado | 2699 ms |
| Speed Index / CLS | 4.56 s / 0 |
| Hilo principal estimado / tareas observadas | 12.01 s / 3.00 s |
| Evaluación JS / estilos-layout / rendering estimados | 4.48 s / 3.95 s / 0.23 s |
| Solicitudes / scripts | 31 / 17 |
| JS transferido / sin comprimir | 258516 B / 835765 B |
| benchmarkIndex | 452.5 |

La advertencia de CPU lenta sigue presente; el multiplicador permanece en 4. La lista de animaciones no compositadas queda vacía en este informe, coherente con el ajuste CSS. Requests y tamaño JS permanecen prácticamente iguales al build 3. La reducción de TBT/layout/rendering es una observación favorable de esta ejecución, sin atribución exclusiva al código porque también cambian las condiciones del equipo y del servidor.

El desglose explica gran parte del menor LCP observado: primer byte de 763 a 102 ms al estar el servidor caliente, mientras el retraso de render cambia de 1886 a 1817 ms. No se presenta 1.92 s como LCP móvil simulado ni como dato de usuarios. El LCP simulado de 3.98 s sigue por encima del baseline 3.22 s; no se da el rendimiento por aprobado ni se borra el resultado 41 del build 3.

## Calculadora: build 3

Informe de las 07:07 UTC: rendimiento 56, accesibilidad automatizada 100, buenas prácticas 96, SEO automatizado 100. FCP 2.68 s, LCP simulado 3.18 s, LCP observado 1.93 s, TBT 3948 ms, Speed Index 5.05 s y CLS 0. También incluye advertencia de CPU (benchmarkIndex 339). No hay un baseline equivalente de calculadora para afirmar una mejora.

## Artículo válido: build 4

Informe de las 07:16 UTC sobre `/blog/preparar-briefing-web-en-el-navegador`, HTTP correcto. Rendimiento 46, accesibilidad automatizada 96, buenas prácticas 96 y SEO automatizado 100. FCP 2.73 s, LCP simulado 4.85 s, LCP observado 1.97 s, TBT 3553 ms, Speed Index 4.04 s y CLS 0. Hilo principal estimado 12.02 s y arranque JavaScript estimado 5.08 s. También incluye advertencia de CPU, benchmarkIndex 447. No se dispone de un baseline equivalente de ese artículo.

La auditoría identifica un único elemento de contraste insuficiente: «Sobre el autor», `text-white/40`, ratio observado 3.77:1 para texto de 12 px frente al requisito 4.5:1 que aplica la auditoría. Raíz cambia después esa clase a `text-white/60` para el build siguiente. En el build 5 el estilo computado confirma blanco con alpha 0.6. Axe 4.13.0 focal devuelve comprobación incompleta por fondo degradado, por lo que no se anota un aprobado automático. El cálculo manual sobre muestras próximas al rótulo encuentra un mínimo local de 6.58:1 (fondo RGB 44,28,47; texto compuesto 171,164,172). Es una comprobación local de ese elemento, no una nota nueva ni una certificación global. Se conserva el resultado automatizado 96. El ajuste de color no altera los contratos HTTP/metadata cubiertos por el rastreo de 159 rutas del build 4.

El build 5 incorpora además una corrección de pausa de Marquee y del guard de sesión para evitar renovación de cookies desde precargas protegidas después del logout. Sus pruebas son específicas. No se atribuye una nueva ejecución Lighthouse a ese build: las cifras anteriores corresponden a los artefactos indicados.

Su build ID, verificado en disco, es `EXwr7f1qR5891HUKhrLTQ`. Raíz reporta compilación/TypeScript correctos y 192 rutas estáticas; las comprobaciones focales de interfaz y logout están coordinadas por separado. El informe de la carrera de sesión distingue reproducción anterior, parche y pruebas: [cierre de sesión](./auth-signout-race.md).

En portada, calculadora y artículo, el único error de consola de estos informes corresponde al 404 local de `/_vercel/insights/script.js`; explica la penalización de buenas prácticas observada. No se considera un error confirmado del servicio desplegado en Vercel. Accesibilidad/SEO 100 son resultados de comprobaciones automatizadas, no una certificación completa ni garantía de posicionamiento.

## Evidencia y pendiente

- `.local/home-mobile-build2-baseline.report.json`: copia preservada del baseline, ignorada por Git.
- `output/performance/home-mobile-final.report.json` y `.html`: primera ejecución del build 3.
- `output/performance/calculator-mobile-final.report.json` y `.html`: calculadora build 3.
- `output/performance/home-mobile-build4.report.json` y `.html`: tercera observación de portada, ajuste CSS final y servidor caliente.
- `output/performance/article-mobile-build4.report.json` y `.html`: artículo válido y hallazgo de contraste anterior a su corrección.
- Rastreo HTTP completo de build 4 aprobado con 159 rutas y 24 OG: [informe de rutas públicas](./public-route-qa.md).
- Pendiente: medir en Preview con recursos QA aislados. Después, mantener métricas de campo para validar visitas reales; todavía no existen datos nuevos que prueben resultados comerciales o Core Web Vitals de usuarios. Un intento anterior sobre una URL de blog equivocada devolvió 404 y queda excluido como auditoría del blog.
