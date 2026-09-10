# Cierre de sesión y respuestas de precarga

10 de septiembre de 2026. Hallazgo reproducido con cuentas ficticias de QA sobre el cuarto build de producción **local**, en `http://localhost:3010`. No se atribuye esta prueba al sitio publicado ni a datos reales.

## Defecto verificado

Al cerrar sesión ADMIN inmediatamente después de entrar, el POST de Auth.js borraba la cookie correctamente. Una precarga de `/admin/clientes`, iniciada antes del cierre, terminaba después y volvía a escribir una cookie válida. La siguiente navegación de red a `/admin` mantenía acceso ADMIN.

La instrumentación registra únicamente tiempos, rutas, estados HTTP y presencia o borrado de cookie, nunca su valor:

| Prueba | Secuencia observada | Resultado |
| --- | --- | --- |
| Cierre inmediato | Sign-out borra cookie a 7.417 ms; precarga de clientes emite cookie a 7.483 ms | Al llegar a inicio queda una cookie de sesión; `/admin` responde 200 |
| Cierre tras terminar las precargas | Última precarga a 7.502 ms; sign-out borra cookie a 8.560 ms | Cero cookies de sesión; `/admin` redirige 307 a `/admin/login` |

Evidencia local ignorada por Git: `output/playwright/signout-race-build4.json`. La segunda prueba terminó con un error del diagnóstico al leer `.user` de una sesión nula; el recuento de cookies y la redirección ya estaban registrados y son el resultado esperado de un cierre correcto.

## Causa y corrección

`next-auth/lib/index.js`, en `handleAuth`, obtiene la sesión y añade sus cookies a la respuesta final después del callback de autorización. La lectura de una sesión JWT renueva la cookie. El proxy anterior usaba directamente ese wrapper también para las precargas de las rutas privadas.

`src/proxy.ts` conserva el wrapper `auth`, todas las comprobaciones de sesión y rol y el matcher existente. Después de esperar su respuesta final, retira `Set-Cookie`. No cambia el estado, el cuerpo, `Location` ni `x-middleware-next`.

El proxy pasa a autorizar sin escribir cookies. Las rutas `/api/auth/*` quedan fuera del matcher y conservan la emisión, renovación y eliminación de cookies. Las lecturas del proxy dejan de prolongar la sesión; su caducidad sigue la última acción de Auth que escribió la cookie. Una cookie inválida se rechaza aunque el proxy ya no pueda eliminarla; los endpoints Auth conservan esa limpieza.

La solución evita reimplementar decodificación, secretos, sales, cookies seguras o fragmentadas. No se ha demostrado ninguna relación causal con retirar `SessionProvider` y no se atribuye a ese cambio.

## Verificación

- `npx tsx --test tests/auth-proxy.test.ts`: tres pruebas aprobadas, importando el proxy y la configuración Auth reales con base de datos en memoria y un secreto aleatorio exclusivo del proceso de test.
- ADMIN accede a rutas privadas; CLIENT accede a dashboard y es rechazado en ADMIN. Las respuestas conservan estado, redirección y cabecera de continuación.
- Cookies HTTP, HTTPS y fragmentadas; sesiones ausentes, caducadas e inválidas.
- El endpoint de sesión sigue renovando; el cierre con CSRF real elimina la cookie; una respuesta privada anterior no contiene una escritura que pueda restaurarla.
- Lint focal y comprobación de espacios del diff aprobados. El fallback de secretos queda delegado al código Auth.js sin modificar; no se simula cambiando variables tras una importación ya cacheada.

Repetición final aprobada en el quinto build local, `EXwr7f1qR5891HUKhrLTQ`: acceso ADMIN por formulario a `/admin`, cierre inmediato desde Sidebar, cero cookies de sesión al llegar a inicio y navegación de red `/admin` → `/admin/login`. El acceso CLIENT llega a `/dashboard`; cerrar desde Seguridad deja cero cookies y `/dashboard` vuelve a `/login`. No se esperó a terminar las precargas para cerrar ADMIN.

`output/playwright/auth-content-build5-results.json` registra ambas comprobaciones y el cierre del navegador en `finally`. Se usó una sola instancia Chrome con credenciales ficticias leídas privadamente desde un archivo 600, sin contraseñas en argumentos, salida ni capturas. El coordinador centraliza build y revisión global. Esta comprobación cubre estos recorridos locales y la carrera reproducida, no una auditoría exhaustiva de todos los flujos de autenticación.
