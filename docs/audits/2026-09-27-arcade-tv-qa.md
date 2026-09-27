# QA de la ampliación Arcade / TV

Fecha: 27/09/2026. Base: `2ab891f`. Alcance: cambios locales de esta entrega, no una auditoría completa del comercio, CRM o contenido SEO. Trabajo realizado con un único agente.

## Resultado

Los recorridos críticos locales están verificados. La publicación se debe confirmar mediante el estado Vercel del commit que contiene este informe; este documento no convierte un push en un despliegue completado.

- Salto Zero cooperativo: cuatro mundos, doble salto, escudos, checkpoints, vidas compartidas y cadenas de monedas.
- Neon Clash: dos luchadores originales, ataques, bloqueo, energía, proyectiles y victoria por rondas.
- Isla libre: dos vistas sobre un único mundo creativo, materiales, vuelo, edición y guardado local.
- Ambientes en reposo: respiración y hojas, lluvia, nubes, agua, estrellas y naves flotando. No se mueve la posición lógica de un personaje por su animación ambiental.
- Teletexto con foto real y contenido de Andrés y Luis; tres páginas.
- Foto voluntaria enviada por un canal WebRTC fiable, con confirmación de recepción y retirada de la pantalla a los 60 segundos. Sin almacenamiento público ni publicación automática en Instagram.
- Mando de TV oculto en móvil; dock separado de la carcasa; scroll interior en pantalla ampliada y exterior en modo normal.
- Sonido opt-in, pausa al perder conexión, reconexión de la misma plaza, revancha acordada desde ambos mandos, modo demostración y diagnóstico técnico local.

## Verificación reproducible

| Comprobación | Resultado |
| --- | --- |
| `npm test` | 269/269, 49 suites, 0 fallos; log local `/tmp/latech-arcade-final-tests.log` |
| ESLint de archivos afectados | Correcto; repetido para BlocksGame tras el ajuste final de movimiento reducido |
| `git diff --check` | Sin errores |
| `npm run build` con configuración QA aislada | TypeScript correcto y 193 páginas generadas; repetido tras las correcciones de input y altura |
| `npm audit --omit=dev` | 0 vulnerabilidades |
| Auditoría completa de dependencias | 4 moderadas de desarrollo en la cadena drizzle-kit / esbuild; no se aplicó el downgrade rompedor sugerido |
| Identidad Git y cuenta GitHub | Andreh33, ID 119471787, correo noreply autorizado; remoto Andreh33/jaja; main sin divergencia antes de publicar |

El entorno usa `LATECH_ISOLATED_QA=1`, `.next-qa`, SQLite local `.local/qa.db` y puerto 3103. No se modificaron datos de producción. Se añadió únicamente la tabla arcade que faltaba en la base QA. Los campos nuevos de la entrega son propiedades opcionales del JSON de una columna ya existente: no requiere migración.

### Navegador Chromium real automatizado

- Portátil 1366×768: botón de mando visible y comprobado con `elementFromPoint` para descartar que la tele lo tape.
- Arcade: cooperativo visible con suelo completo; arte de lucha y mundo de bloques inspeccionados.
- Dos contextos de teléfono: señal directa, controles de ambos jugadores, golpe que reduce la salud rival, reconexión que conserva asiento y pausa la partida.
- Isla: ambos mandos cambian sus materiales de forma independiente dentro del mundo compartido.
- Mando a 320 px: sin desbordamiento horizontal en el flujo comprobado.
- Foto: selección de archivo de prueba en el teléfono, conversión JPEG, transmisión, ACK, imagen expandida y desaparición tras avanzar 61 segundos el reloj de la página. No se simuló una cámara física.
- Teletexto: altura útil, cambio de página y foto real; scroll desde el teléfono mueve su contenedor sin mover la página detrás.
- Tras reducir la pantalla, el mismo botón del teléfono desplaza la web exterior.
- Home a 390×844: invitación del mando oculta.

Evidencias locales, no incluidas en Git: `output/playwright/final-photo.png`, `final-teletext.png`, `final-laptop-controls.png`, `final-home-mobile.png`, `final-fight-remote.png`, `final-blocks-remote.png`, `final-controller-320.png`. Los scripts exploratorios están en esa misma carpeta. Algunas pruebas necesitaron reanudarse después de corregir selectores duplicados; no deben tratarse como una suite CI portable sin adaptación.

## Revisión de código: defectos encontrados y resueltos

- La foto y el teletexto colapsaban con `height:100%` dentro de un padre auto: usan ahora el contrato explícito de altura de Studio; prueba de regresión y captura posterior.
- Una pulsación breve recibida entre fotogramas podía perderse: buffer de flancos con consumo único y caducidad acotada, probado unitariamente.
- La limpieza WebGL provocaba pérdida de contexto al reutilizar canvas en Strict Mode: se liberan recursos sin forzar la pérdida del contexto.
- La validación JPEG asumía que las marcas inicial/final no se dividían entre chunks: acepta las divisiones correctas y rechaza tamaños/firmas incorrectos, con pruebas.
- El teléfono podía indicar envío sin confirmación: ACK asociado a un identificador, límites de tiempo y limpieza de listeners.
- Solicitudes tardías al cerrar el fotomatón: guardas de montaje, exclusión de arranques y cierre de la sala creada si ya no se utiliza.
- Reintento de aviso de fin de partida acotado a tres intentos; votos de revancha reinician una sola versión compartida.

No quedan hallazgos funcionales bloqueantes reproducidos dentro de los flujos anteriores. Esto no equivale a ausencia universal de errores.

## Revisión de movimiento

| Before | After | Why |
| --- | --- | --- |
| Escenarios quietos cuando no se pulsa | Capas ambientales y respiración sutil, sin modificar colisiones | Cumple la dirección de juego vivo sin interferir en el control |
| Animación ambiental sin una única variante consistente | Guardas de movimiento reducido en canvas/Three y CSS; también en el desplazamiento lateral de las hojas | Mantiene legibilidad y evita movimiento innecesario para esa preferencia |
| Entradas que podían desaparecer entre frames | Buffer breve con expiración de 320 ms | Respuesta consistente; no añade una transición a los controles de juego |

Decisión: aprobar la coreografía nueva en el alcance revisado. Las animaciones de apertura largas son una decisión cinematográfica explícita del usuario, no el patrón de los botones. No se han añadido transiciones de layout a los ambientes CSS: usan transform y opacity. El sonido requiere activación.

## Límites importantes

- No se han probado teléfonos físicos, Safari iOS ni todas las redes. WebRTC utiliza STUN, sin un servicio TURN pagado: ciertas redes pueden impedir la señal directa. No se promete latencia cero. Los juegos por turnos siguen disponibles.
- Con tres contextos headless, el RAF del host llegó a 1–2 fps aunque el dibujo canvas medido era pequeño; se verificó función con entradas mantenidas. Ese resultado no sirve para afirmar rendimiento de un móvil o portátil físico ni se ha ocultado como una prueba de fluidez superada.
- No es posible desplazar por DOM una web externa de otro origen sin su cooperación; el mando lo explica. Studio y teletexto propios sí tienen scroll interior.
- Diagnósticos: búfer local de 80 eventos y muestras de FPS, sin fotos, tokens, SDP o perfiles. No es vigilancia autónoma de producción ni reparación automática.
- Consola local: 404 esperado de `/_vercel/insights/script.js` al usar Next start fuera de Vercel, y avisos de precarga CSS. No se observó otra excepción no explicada en los flujos finales.
- Se interpretó «logo antiguo» como la cámara clásica de Instagram; el logo de Latech permanece en pantalla.

## Skills y recursos

`web-design-director` y `emil-design-eng` guiaron jerarquía y respuesta; `animate` / `review-animations` guiaron los ambientes y su variante reducida; ImageGen produjo arte original; `agency-web-qa-deploy`, `review-code-high-signal`, Playwright y continuidad estructuraron la validación y la entrega. 21st.dev se consultó como referencia pública, sin afirmar sesión autenticada ni instalar componentes. Three.js y sus tipos se incorporaron con licencia MIT.

Especificaciones del arte: [recursos de Arcade](../progress/2026-09-27-arcade-assets.md).
