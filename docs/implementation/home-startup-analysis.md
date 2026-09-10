# Arranque móvil: lectura del build 2

Revisión acotada de código, HTML generado y el informe Lighthouse de la portada del 10-09-2026. No se abrió navegador ni se cambió código durante esta lectura. Baseline conservada en `.local/home-mobile-build2-baseline.report.json`, ignorada por Git.

## Qué mide realmente

El informe obtiene rendimiento 54, TBT aproximado 5.56 s, LCP 3.2 s y CLS 0. Usa throttling simulado con factor CPU 4. Advierte que la CPU del equipo es más lenta de lo esperado (`benchmarkIndex: 305.5`): es una prueba de laboratorio local, no datos de usuarios móviles. `diagnostics.totalTaskTime` es 4.93 s y el desglose estimado de hilo principal 19.73 s. Comparar cambios bajo las mismas condiciones y conservar la advertencia.

El chunk `08igo-z3lqag5.js` contiene React DOM/Next y acumula 5.11 s estimados de evaluación. Esto incluye trabajo de hidratación y actualizaciones de los componentes de la aplicación; no identifica una dependencia culpable por sí solo. El parseo/compilación total es 0.50 s frente a 6.95 s de evaluación y 5.13 s de estilos/layout. El informe no atribuye CPU a terceros. La solicitud local de Vercel Analytics responde 404, sin contenido; ese estado no prueba un fallo de Analytics en Vercel.

## Trabajo evitable identificado

1. `PlaygroundSection` monta siempre los tres componentes dynamic de Escape, Capó y Rayos X con `open=false`. Eso descarga y evalúa módulos antes de una interacción. El informe muestra los chunks diferidos a unos 4.1 s; el módulo de Escape pesa aproximadamente 58.6 KB sin comprimir. Su wrapper sí evita montar el motor mientras está cerrado: no se ha encontrado un juego activo oculto. Cargar cada componente solo tras su primera apertura evita esos imports iniciales; conservar el cierre y retorno de foco al aplicar el cambio. DrawingBoard y Runner ya usan el observador de proximidad.
2. `StatsSection` monta cuatro `NumberFlowCore` para valores constantes, mucho más abajo del primer viewport. La librería construye shadow DOM; Lighthouse localiza allí la profundidad máxima 19. El HTML SSR contiene 1046 elementos y la página final 1136. Texto estático para valores que nunca cambian elimina trabajo sin perder una animación de actualización observable. No se cuantificó su contribución aislada al TBT.
3. Sonner obtiene `getComputedStyle(document.documentElement).direction` como valor por defecto de `dir`. El punto del bundle señalado por forced-reflow coincide con esa función y atribuye 12.6 ms. `dir="ltr"` en el Toaster evita esa consulta en esta web española; es una mejora pequeña, no explicación de varios segundos.
4. El Provider de Auth.js envuelve también la portada y el reporte contiene dos GET de sesión. La búsqueda en `src` encuentra consumidores imperativos `signIn`/`signOut`, pero ningún `useSession`. Revisar si el contexto público es necesario permitiría reducir trabajo global; cualquier cambio requiere revalidar login, logout, registro y administración.

Los puntos de reflow de Motion leen dimensiones/offsets para seguimiento de scroll; uno acumula 24 ms atribuibles. El agente de juegos está revisando los efectos para distinguir trabajo imprescindible de suscripciones móviles innecesarias. El LCP observado es el párrafo descriptivo del hero, que tiene clase de entrada CSS; la nota del código que presupone que siempre es el H1 no describe este viewport.

La siguiente medida útil es aplicar cambios acotados de carga/móvil, reconstruir y repetir la prueba de forma aislada. No se promete una puntuación ni se asigna todo el coste de React a un único componente a partir del nombre del chunk.

## Revisión de los ajustes posteriores

Raíz aplicó el montaje condicional de las tres demos, texto estático para las cifras del hero/estadísticas, dirección explícita del Toaster y retirada del Provider de sesión global. También sustituyó la medición síncrona de cada Reveal por `IntersectionObserverEntry.boundingClientRect`. La lectura independiente confirma que `auth()` y sus controles del servidor permanecen intactos; el cliente instalado de Auth.js ejecuta signIn/signOut con CSRF y POST independientemente del Provider, y el código de la aplicación no consume useSession. La validación de login/logout/editor y la nueva medición corresponden al siguiente build.

La revisión detectó un defecto de foco en Capó/Rayos X: usaban Dialog modal sin Trigger y el cierre predeterminado de Radix solo intentaba enfocar triggerRef, que estaba vacío. Raíz añadió captura del elemento enfocado en onOpenAutoFocus y restauración explícita en onCloseAutoFocus si sigue conectado; se comprobó el código corregido. Escape ya dispone de limpieza del motor, cierre del diálogo y restauración del elemento previamente enfocado. No atribuir a esta lectura una prueba de teclado en navegador de los ajustes posteriores.

También se revisó el scheduler compartido posterior de Breathe/WordPress: una sola rAF por lote, todas las lecturas antes de las escrituras, registro de elementos visibles mediante IO y retirada de listeners al vaciarse. La media query excluye móvil, puntero grueso y movimiento reducido. No se encontró un defecto funcional alcanzable en esa lectura; la nueva medición es necesaria para cuantificar el resultado.
