# Latech Arcade · canal secreto

## Experiencia

Tres pulsaciones del logo principal en el inicio abren un CRT casi a pantalla completa. La entrada dura cuatro segundos y carga las imágenes en paralelo. Si la red tarda más, se indica la carga pendiente; no se inventa un porcentaje. Escape sale. El movimiento reducido conserva una entrada estática.

- **Salto Zero:** plataformas original, cuatro mundos, monedas, enemigos, puntos de reaparición, salto variable y teclado. Mando 1 mediante WebRTC cuando la red permite conexión directa.
- **Space Wars:** cooperación de dos jugadores, diez oleadas, escudos, energía y blindaje. Los turnos no otorgan ventaja por latencia.
- **Mar abierto:** batalla naval con dos flotas privadas, una en cada móvil. La pantalla pública nunca recibe las posiciones ocultas.
- **Cuatro en órbita:** bonus de cuatro en raya para dos.

Los controles de acción usan un canal WebRTC no ordenado, sin retransmisión de estados antiguos, con máscaras de nueve bits, secuencia y recuperación de la última pulsación. Un watchdog libera los botones tras 320 ms sin señal. No se pide cámara ni micrófono para jugar. STUN público de Cloudflare; soporte opcional TURN sin contratar ni configurar un relay. Redes restrictivas pueden impedir la conexión directa: se informa y siguen disponibles teclado y juegos por turnos. No se promete latencia cero. Detalles en [red de los mandos](arcade-network.md).

## Arte de ImageGen

Generación con la herramienta integrada ImageGen. Los archivos de producción se guardan en `public/arcade/`, convertidos a WebP conservando alfa. No se ha hecho un reescalado ficticio a 4K. Se solicitó la máxima definición nativa disponible; las dimensiones efectivas son:

| Archivo | Dimensiones | Uso |
| --- | --- | --- |
| platform-world.webp | 1672 × 941 | Mundo vivo del plataformas |
| platform-world-2.webp | 1672 × 941 | Jardines elevados, flores y cascadas |
| platform-world-3.webp | 1672 × 941 | Ruinas doradas al atardecer |
| platform-world-4.webp | 1672 × 941 | Archipiélago nocturno, aurora y cristales |
| platform-sprites.webp | 1254 × 1254, alfa | Robot original, enemigos, moneda, ladrillo, plataforma, portal |
| space-world.webp | 1672 × 941 | Espacio y cabina desgastada |
| naval-world.webp | 1672 × 941 | Océano y metal envejecido |
| tactical-sprites.webp | 1254 × 1254, alfa | Naves y barcos originales |
| worn-plastic.webp | 1536 × 1024 | Material real generado del mando TV y gamepads |

### Prompts finales (especificación de producción)

1. **Plataformas:** fondo ancho 16:9, máxima resolución nativa, estilo 2.5D pintado y detallado, cielo turquesa, islas verdes, cascadas, ruinas cobalto, flores naranjas, arcos flotantes; centro despejado, sin personajes, texto ni interfaz.
2. **Plástico:** textura ortográfica de ABS carbón de los noventa, grano fino, zonas pulidas por uso, arañazos y polvo sutil; luz difusa, sin objeto, botones, logotipos ni sombras de producto.
3. **Atlas plataformas:** cuadrícula 3×3 transparente. Robot propio con casco azul y pañuelo naranja de pie, corriendo y saltando; escarabajo naranja, dron violeta, moneda dorada; bloque ámbar, plataforma herbosa, portal cian. Sin personajes de franquicias.
4. **Espacio:** fondo ancho, campo estelar azul noche, planeta cian lateral, sol naranja, nebulosas y asteroides periféricos; cabina gunmetal desgastada al pie, centro vacío para tablero real, sin texto ni retícula dibujada.
5. **Naval:** océano azul turquesa al anochecer, islas remotas periféricas, detalle de agua, borde inferior de metal naval con salitre y óxido, centro libre, sin barcos ni retícula ni texto.
6. **Atlas táctico:** cuadrícula 2×2 transparente. Dos interceptores espaciales vistos desde arriba apuntando abajo, uno azul/cian y otro blindado gris/ámbar; destructor y submarino hacia arriba. Materiales gastados, siluetas legibles, sin etiquetas.
7. **Jardines:** paisaje de plataformas original, ancho 16:9, jardines suspendidos con árboles enormes, flores naranjas, verdes vivos y cascadas turquesa. Detalle pintado 2.5D, centro legible, sin personajes, texto ni interfaz.
8. **Guardianes:** ruinas flotantes doradas al atardecer, arcos de piedra, terracota, estatua guardiana y nubes melocotón. Colores vivos, perspectiva lateral compatible con plataformas, sin interfaz ni personajes.
9. **Noche:** archipiélago cobalto iluminado por luna cian, aurora, cristales y faroles ámbar. Fantasía luminosa detallada, contraste con el personaje, sin texto, interfaz ni personajes.

## Protocolo y seguridad

Tabla aislada `tv_arcade_sessions` declarada en `drizzle/schema.ts`. Dos invitaciones de un solo uso, cinco minutos para escanear y treinta minutos por sala. Secretos aleatorios de 256 bits almacenados como SHA-256. Tokens en el fragmento del enlace, limpiado inmediatamente por el móvil; nunca en parámetros de consulta. Autorización de host y de cada jugador separadas. Versionado de movimientos y transacciones contra reintentos o carreras. Datos SDP limitados y visibles únicamente a los extremos de su conexión.

Las rutas exigen mismo origen, JSON, límites de tamaño y frecuencia. Flotas y puntuación táctica se calculan en servidor. No hay URLs, scripts ni comandos arbitrarios transportados por los mandos. El CRM requiere ADMIN y proyecta solo nombre ya autenticado, fecha, dispositivo, navegador y ubicación aproximada del servidor. No GPS, IP en claro ni huella digital. Visitantes sin cuenta: anónimos.

Cerrar la sala invalida los secretos y borra SDP. La retención diaria borra secretos/SDP caducados, HMAC de creación después de 24 horas y registros después de treinta días. Crear otra sala también aplica esta limpieza. La base de pruebas es local y separada de producción.

## Activación

El usuario autorizó la migración limitada y publicación el 27/09/2026. Se han creado en producción `tv_remote_sessions` y `tv_arcade_sessions`, con cinco índices, mediante `TV_REMOTE_SCHEMA_ONLY=1 npm run db:push -- --strict --verbose`, conservando ambas guardas. La comparación SHA-256 del esquema excluyendo las tablas nuevas confirma que las 41 estructuras anteriores no cambiaron. No ejecutar un push completo del esquema para esta función: hay drift histórico ajeno a estas tablas.

## Referencias consultadas

- [21st · 8bit Difficulty Select, OrcDev](https://21st.dev/community/components/OrcDev/8bit-difficulty-select/default): referencia de selección retro; solo consulta pública, sin instalar código. CLI no autenticado y lectura web intermitente. Sin añadir framework ni dependencia.
- [MDN · RTCDataChannel](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel): canal de datos entre pares.
- [Cloudflare · STUN y TURN](https://developers.cloudflare.com/realtime/turn/faq/): STUN público gratuito; TURN no contratado.

## Validación

Pruebas reproducibles en `tests/arcade.test.ts`: 19 pruebas de reglas, privacidad, autorización por asiento, reintentos, cierre/retención, colisiones, monedas, geometría alcanzable de los cuatro mundos y paquetes caducados.
Suite completa: 248/248, 46 suites, sin fallos, ejecutada en serie para limitar consumo del portátil.

QA local con build de producción (27/09/2026): dos pestañas móviles se emparejan automáticamente y limpian el fragmento; WebRTC establece señal directa y transmite movimiento; recargar el mando recupera la conexión; naval, Space Wars y cuatro en raya completan una jugada por jugador y devuelven el turno al primero. Escape cierra y devuelve foco al logo. Anchos 390 y 320 px sin overflow horizontal. Capturas en `output/playwright/arcade-*`, excluidas de Git.
Comprobación final con movimiento normal: triple clic abre el canal secreto; la recuperación del QR de TV en el mismo móvil conserva su credencial y cambia correctamente a French Tacos. El build definitivo genera 193 páginas y pasa TypeScript. La duración total observada con carga fría y el portátil ocupado puede superar los cuatro segundos de animación; no se ha medido como promesa de tiempo de carga real.

Producción verificada en `serviciosonlineweb.com`, commit funcional `22c4883`, despliegue `dpl_H3sRMjz6E2KWZv8giqwTeZ1wFKKD` Ready: emparejamiento del mando TV, dos gamepads conectados, señal directa de ambos y dos turnos de Space Wars completados. Arcade final a 320 px sin overflow. Se cerraron las sesiones de prueba. Margen de QR de cuatro módulos para mantener su zona blanca de lectura.

Límites de evidencia: Chromium emulado, no teléfonos físicos ni Safari. En local, `/_vercel/insights/script.js` devuelve 404 al ejecutar Analytics fuera de Vercel; un sondeo puede recibir el 410 esperado al desconectar la sesión. No equivale a medir latencia en redes móviles reales.

## Revisión de interacción

| Antes | Después | Motivo |
| --- | --- | --- |
| El logo podía activar navegación entre pulsaciones | Tiempo nativo del evento, triple clic nativo y sin navegar si ya está en inicio | Conservar el gesto bajo carga de renderizado |
| Disparos sin señal visual localizada | Marcador de última casilla y onda de 280 ms | Identificar la jugada confirmada |
| Fichas sin entrada ni línea ganadora marcada | Entrada de 240 ms y contorno del cuatro ganador | Hacer legible el resultado |

Entrada cinematográfica de cuatro segundos por petición explícita. Controles breves, hover limitado a ratón y alternativa sin movimiento. La revisión de código ha añadido cierre de salas creadas si se sale mientras la petición está pendiente; la recuperación de QR conserva la credencial del mismo mando.
