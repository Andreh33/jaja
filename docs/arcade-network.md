# Red de los mandos

Los juegos de acción se simulan en la televisión. Los teléfonos envían botones y tasas de mirada mediante un canal WebRTC sin orden ni retransmisión; no envían posiciones ni puntuaciones. Las pulsaciones salen inmediatamente y hay un estado de respaldo cada 25 ms mientras el mando está visible. Un contador y la última pulsación permiten recuperar un toque perdido sin repetirlo. Una entrada que envejece 320 ms deja de mover al personaje.

El emparejamiento conserva las invitaciones temporales, token de asiento, validación de origen y controles de acceso. La señalización consulta cada 500 ms los primeros 20 segundos y después cada segundo. Los juegos por turnos siguen disponibles si no se consigue conexión directa. No se promete latencia cero: depende de dispositivos, navegador y red.

## Recuperación

- La pantalla del teléfono solicita permanecer encendida cuando el navegador lo permite; el sistema puede denegarlo por ahorro de batería.
- Al ocultarse o perder foco se sueltan los botones. Al volver a estar visible o recuperar red se intenta recuperar la conexión.
- La televisión vuelve a crear el enlace si falla o se cierra el canal. La partida de acción se pausa al perder señal para no seguir jugando con un mando desconectado.
- El botón «Reconectar señal» conserva el mismo asiento y permite recuperación manual.
- Si el anfitrión cambia de juego justo después de un turno y su estado aún no se ha actualizado, se consulta la versión actual y se reintenta la selección una sola vez. No se reenvían jugadas ni se omiten controles de autorización.

## Relay opcional para redes restrictivas

La base usa STUN. Se ha añadido soporte compatible con las credenciales temporales de coturn, pero **no se ha contratado ni configurado un relay de producción** en este cambio.

Variables de servidor, nunca `NEXT_PUBLIC_*`:

- `ARCADE_TURN_URLS`: una o varias URLs `turn:` / `turns:` separadas por comas; por ejemplo `turn:relay.example:3478?transport=udp,turns:relay.example:5349?transport=tcp`.
- `ARCADE_TURN_SECRET`: secreto compartido de autenticación REST de un relay administrado por el propietario.

El servidor genera usuario por sala con caducidad de una hora y firma HMAC; la respuesta incluye solo la credencial temporal, nunca el secreto de firma. Configurar un relay requiere revisar proveedor, tráfico, permisos y costes. No introducir credenciales en Git ni reutilizar contraseñas de otros servicios.

## Audio

Activado por defecto. El primer gesto local de teclado o puntero desbloquea Web Audio. El botón de silencio sigue disponible y recuerda la elección en ese navegador. Las restricciones de reproducción automática no se evaden: ver [política de autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
