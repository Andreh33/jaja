---
tipo: nuevo
estado: borrador_local_no_publicado
slug_propuesto: convertir-dibujo-en-nivel-latech-lab
titulo: De un dibujo a un nivel: crea y comparte tu recorrido en Latech Lab
descripcion: Dibuja una línea, conviértela en plataformas y comparte el mismo nivel. Una guía de Tu trazo, un mundo con sus controles y límites reales.
categoria: Tutoriales
---

Nota editorial: intención nueva y concreta, tutorial de la herramienta propia. No sustituye una guía genérica de diseño. Publicar solo cuando `/lab/trazo` esté disponible y el recorrido móvil/teclado se haya comprobado en la versión entregada. No atribuir visitas o viralidad. Evidencia: `src/lib/trace-game/{level,physics,render}.ts`, `TraceExperience.tsx`, `tests/trace-game.test.ts`.

<!-- CUERPO -->
# De un dibujo a un nivel: crea y comparte tu recorrido en Latech Lab

Una línea puede ser el comienzo de algo que otra persona quiera probar. En [Tu trazo, un mundo](/lab/trazo), dibujas un perfil, lo conviertes en plataformas y juegas hasta una bandera. Después puedes compartir un enlace que conserva ese recorrido.

La experiencia no necesita una cuenta. El dibujo se interpreta en el navegador y el enlace contiene la forma necesaria para reconstruir el nivel. No se publica una galería con tu creación.

## Empieza por una línea horizontal

Dibuja con ratón o dedo dentro del lienzo, avanzando de izquierda a derecha. No hace falta que quede perfecta. Puedes combinar subidas y bajadas, pero la línea debe tener algo de recorrido horizontal para que podamos interpretarla.

Si prefieres utilizar teclado o quieres empezar sin dibujar, elige una de las formas preparadas: Olas, Cumbres o Escalera. Después pulsa «Convertir en un mundo». Si el trazo es demasiado corto, la herramienta lo explica y permite intentarlo otra vez.

## Qué conserva y qué transforma la herramienta

El nivel representa el perfil mediante dieciséis alturas. A partir de ellas se crean plataformas y huecos con reglas limitadas. Los cambios de altura muy bruscos se suavizan para mantener saltos alcanzables.

Eso significa que el resultado es una interpretación jugable, no una reproducción exacta de cada movimiento del dedo. Un bucle se lee por su posición horizontal; un garabato no se convierte en código ejecutable. La versión de las reglas viaja en el enlace para reconstruir el mismo recorrido.

## Juega a tu ritmo

El personaje avanza solo. Puedes saltar con espacio, flecha arriba, W o los controles táctiles. Acércate al borde de una plataforma antes de saltar para alcanzar la siguiente.

Tienes un control de pausa y puedes volver a editar el trazo. La partida se detiene al salir de su zona o cambiar de pestaña; revisa el mensaje de pausa y usa «Reanudar» cuando quieras continuar. No hay una compra ni un formulario de contacto bloqueando el juego.

Si no llegas a la primera, puedes repetir el mismo recorrido. También puedes volver al lienzo y cambiar la forma. El objetivo es probar cómo se transforma una idea sencilla en una interacción.

## Comparte el nivel o conserva una tarjeta

«Compartir nivel» utiliza las opciones de compartir del dispositivo cuando están disponibles. También ofrece la copia del enlace y un campo desde el que seleccionarlo manualmente. Quien lo abra recibirá las mismas plataformas.

La tarjeta PNG sirve como recuerdo visual. Para que otra persona juegue, acompáñala del enlace: la imagen por sí sola no sustituye la dirección del nivel. Descargar una tarjeta o abrir las opciones de compartir no publica automáticamente el dibujo en un perfil de Latech.

## Qué puede aportar una experiencia así a una web

Una herramienta propia permite demostrar una idea en lugar de explicarla solo con texto. En este caso, la persona aporta una forma y ve cómo cambia el resultado. Esa participación es la parte interesante del diseño.

Que una experiencia sea compartible no demuestra que vaya a conseguir visitas o clientes. Para evaluar su utilidad, habría que observar su uso y el recorrido posterior con datos reales, sin confundir un intento de juego con una solicitud comercial.

Si estás pensando en una herramienta para tu negocio, empieza por una decisión sencilla: qué aportará el visitante y qué resultado útil recibirá. Puedes describirlo en el [briefing](/briefing) o explorar más ideas en [Latech Lab](/lab).

<!-- FIN_CUERPO -->
