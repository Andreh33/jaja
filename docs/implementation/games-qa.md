# Juegos y móvil — evidencia de entrega

Actualizado 10/09/2026, cierre sobre build 5. Solo worktree de evolución; sin despliegue ni escrituras de producción. Ranking de QA sobre base local.

## Pruebas y revisión

- `tsx --test tests/game-storage.test.ts tests/game-session.test.ts tests/trace-game.test.ts`: **7/7**. Pausas independientes, propietario único/RAF/cleanup, storage bloqueado/corrupto, token válido/inválido y geometría acotada. Tres presets y diez trazos extremos completan el nivel con físicas reales en 15–25 s; sin saltar se pierde y reiniciar restablece estado.
- ESLint aprobado para componentes/motores/modelos, trazo, analytics y pruebas; wrapper Lab volvió a pasar tras ajuste de altura.
- Root centraliza suite global y build. Reportó build1 producción aprobado, 170 rutas estáticas.
- Revisión independiente SEO: carrera POST antiguo→volver menú→categoría nueva resuelta con `ranking.discard()` (abort/generation/payload). No publicar automáticamente al morir.
- Foco Runner: focusin desmontaba Reanudar antes del click. Corregido conservando motivo foco hasta play explícito; prueba de sesión cubre este caso.

## QA real de Chrome

### Home y navegación

- Home a 320/390/820/1280/1440 sin desbordamiento horizontal; Navbar a 1280 cabe incluyendo Laboratorio. Dos frases de marca intactas, precio 600+60/IVA visible a 390.
- Menú a 390 bloquea scroll y mantiene13 pulsaciones de Tab dentro del diálogo; Escape devuelve foco a Abrir menú. Menú a 320: 10 enlaces, sin recorte horizontal y contenido desplazable.
- FAQ con JS: Enter abre, espacio cierra. Más testimonios mueve scrollLeft 24→316 sin alterar scrollY 10117 a 320 con movimiento reducido.
- Contexto temporal sin JS, cerrado después: FAQ abre respuesta nativa; Proceso visible sin ancestros ocultos; 6 testimonios visibles y flecha mueve 24→64 sin cambiar scrollY 9322.
- Capturas: `output/playwright/home-{320,390,820,1280,1440}.png`, `mobile-menu-390.png`, `menu-320.png`, `home-nojs-{faq,process,testimonials}-390.png`.

### Runner y Pizarra

- Runner tutorial→inicio→salto/doble→P; pausa conserva 6 m→6 m; Reanudar enfoca CANVAS en producción. Salir del foco pausa; reanudar con Enter permite continuar. Resultado real 33 m/ récord local y Otra vez→P comprobados.
- Pizarra tap→undo 0→redo 32 píxeles; trazo 865→goma 841; espacio/flechas dibujan. Resize a 820 conserva trazo; 390 sin overflow. PNG descargado por evento real y revisado visualmente 1600×1000, sin cursor exportado.
- Capturas: `runner-result-prod-390.png`, `runner-paused-390.png`, `lienzo-{390,820}.png`, `lienzo-proof.png`.

### Escape

- Menú→Normal/Infinito→intro→salto/doble/dash→P→Reanudar foco CANVAS→resultado.
- Alias `WD prueba W D` se escribe sin activar controles. Cero POST automáticos al morir.
- Publicación explícita local HTTP 200 y categoría infinito/normal correcta. Contrato e idempotencia también probados por arquitectura.
- Elegir modo cambia a campaña. Horizontal 844×390 desplaza hasta Jugar (top 256/bottom 303); Escape cierra y restaura Abrir el juego.
- 320 px HUD/controles caben. Movimiento reducido obliga Efectos suaves marcado/deshabilitado. El scrollWidth del modal incluye clones decorativos recortados, sin pérdida de controles.
- Capturas: `escape-menu-390.png`, `escape-menu-landscape.png`, `escape-landscape-play-reachable.png`, `escape-result-390.png`, `escape-playing-320.png`.

### Trazo

- Preset Olas con Enter→convertir→jugar→pausa estable 5.4853%→5.4853%→Reanudar foco CANVAS→perder→reiniciar.
- Partida completa ganada en navegador: 16 pulsaciones de espacio leyendo progreso público, sin modificar estado interno; 100%, 17.8 s y pantalla ¡Llegaste!.
- PNG 1200×630 descargado y revisado visualmente. Compartir genera enlace versionado con 16 alturas; abrirlo carga directamente el mismo nivel.
- Dibujo de ratón→pointercancel→convertir funciona. Versión inválida explica error y permite recuperar con Cumbres.
- Capturas: `trazo-lost-390.png`, `trazo-run-390.png`, `trazo-proof.png`.

## Cierre visual sobre build 4

- Canvas Runner de Lab en build 1 era 346×173 y podía recortar salto. Wrapper con altura explícita corrige Runner y Pizarra, sin tocar home.
- QA a 320 encontró H1 Latech del catálogo recortado pese a documento 0 overflow global. CSS móvil ajustado a clamp(48px,15vw,78px). Antes: `lab-320.png`.
- Comprobados sobre build4: H1 Latech llega a270.6px dentro de320; canvas Runner390 ahora312×320, con personaje/salto visible, pausa y foco CANVAS al reanudar. Capturas `lab-final-320.png` y `runner-final-double-jump-390.png`.
- Navbar1280 con el CTA Ver servicios cabe (último enlace termina1229px, nav1254px). Captura `navbar-final-1280.png`.
- Home Escape/Capó/Rayos X abren después del montaje condicional; Escape cierra cada diálogo, restituye su botón y libera body overflow.
- Breathe/WordPress: ocho wrappers y tarjetas con transform none en móvil; escritorio muestra escala/rotación/degradado; activar movimiento reducido restablece none y oculta la copia decorativa del texto.
- Capturas públicas finales revisadas: `home-final-390.png`, `home-final-1440.png`. La captura ganadora Trazo existente es reutilizable.
- Marquee: se encontró un fallo de cascada en build4 (regla global animation ganaba al utility Tailwind, así que seguía moviéndose pese a estado paused). Corregido usando animationPlayState inline y listeners foco/hover. ESLint PASS.

## Cierre focal sobre build 5

- Marquee móvil390: ambas animaciones tienen playState paused, currentTime0 y matrices idénticas después de300ms. Flecha derecha permite desplazamiento manual0→40.
- Escritorio1440: running→focus paused (matriz estable)→salir del foco running. TechMarquee running→hover paused→salir running. Con movimiento reducido, ambos paused y desplazamiento manual0→40 disponible.
- Capturas definitivas de producción revisadas: `output/playwright/home-final-390.png`, `home-final-1440.png`, `calculator-production-final-390.png`. Calculadora en estado inicial, scroll0, precio600€+60€/mes visible, sin badge de desarrollo ni solape de navbar;0overflow.
- `Sobre el autor`, artículo `/blog/preparar-briefing-web-en-el-navegador`: color computado `oklab(0.999994 0.0000455677 0.0000200868 / 0.6)`, fuente12px/peso600 y fondo glass `rgba(20,14,35,.55)`.
- **Axe-core4.13.0, solo color-contrast:** sin violaciones confirmadas, sin passes, **incomplete:bgGradient**, porque el gradiente impide determinar automáticamente el fondo. Esto NO es un PASS de axe ni una nota global100.
- Cálculo manual sobre píxeles de fondo próximos al rótulo en `author-bio-contrast-final-390.png`: RGB(44,28,47), texto blanco/60 compuesto RGB(171,164,172), mínimo muestreado **6.58:1**, superior a4.5:1. Muestreo x49–189, filas410/412/414/431/433/435; fórmula de luminancia relativa sRGB y composición alpha0.6. Sobre base hipotética #0e0a1a resulta7.26:1; se usa6.58 de la captura, sin generalizar a todos los fondos/estados.
- Coordinador reporta build5 PASS y suite global140/140. No se volvió a ejecutar Lighthouse performance para este cierre.
- Chrome `latech-qa-final` cerrado al terminar. No quedan correcciones conocidas de juegos/móvil pendientes.

## Límites de evidencia

- El navegador automatizado mantuvo document.hidden=false tras bringToFront de otra pestaña: **visibilidad real no verificada en navegador**. Pausa manual se conserva; visibilidad y viewport están cubiertos por prueba de sesión.
- No se completaron manualmente los cuatro jefes de Escape ni se oyó audio en altavoces. Mecánicas/audio/cleanup revisados; storage bloqueado probado en unidad, no recorrido completo de navegador.
- Sin excepciones funcionales observadas. Consola local 404 del script de Vercel Analytics (fuera de Vercel) y avisos preload CSS. Una sesión CLI se cerró inesperadamente; se recreó y repitió QA pendiente, sin atribuirlo a la aplicación.
- Medición opcional usa solo enums/booleanos; no dibujo/token/alias/URL en propiedades. Aviso sin JS en Trazo con explicación textual.

## Código

Ronda posterior a build 2: root reportó Lighthouse móvil54/TBT5560ms. Se retiraron 13 suscripciones Motion/scroll de Breathe/WordPress en móvil/reduce; desktop ahora procesa solo elementos visibles con un scheduler y lecturas en bloque. Marquee móvil es estático/desplazable y escritorio pausa fuera de vista/pestaña oculta. ESLint focal PASS y comprobaciones funcionales en builds4/5 anteriores. La medición de rendimiento global la centraliza root, sin atribuir todo el resultado a un único efecto. Root cambió además los overlays para montarlos solo al abrirlos.

React conserva menús/resultados. Motores/modelos separados para Runner/Escape; game-session administra RAF/foco/visibilidad/propietario; game-storage defensivo; escape-audio desechable; rankinghook publicación explícita e idempotente. lib/trace-game contiene generador/físicas/render; /lab/trazo edición/juego/share/PNG.
