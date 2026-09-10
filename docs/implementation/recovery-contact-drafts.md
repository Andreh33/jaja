# Recuperación, contacto y borradores

Cambios implementados en el worktree de evolución; no se han enviado correos reales, ejecutado recuperaciones contra producción ni migrado datos.

## Recuperación

No se encontró un proveedor de correo configurado en local ni en los entornos Vercel revisados por el agente coordinador. En vez de devolver un enlace de recuperación al solicitante, `/api/auth/forgot` responde de forma uniforme con recuperación asistida (503, `RECOVERY_ASSISTED`, sin caché). La página explica el proceso y ofrece WhatsApp/contacto sin afirmar que haya enviado un correo.

`/api/auth/reset` devuelve 410 `RECOVERY_LINK_RETIRED`: los tokens antiguos ya no autorizan un cambio de contraseña por ese endpoint. `/recuperar/[token]` redirige al aviso de enlace retirado; no serializa el token al cliente. Se eliminó el formulario inseguro de reset anterior. No se alteran inicios de sesión, pagos ni cursos.

La recuperación automática queda pendiente de un proveedor real y de un flujo completo de emisión, entrega y consumo seguro; la interfaz no lo oculta. Los tokens antiguos pueden seguir almacenados, pero esta ruta ya no los acepta.

## Contacto

`src/lib/contact-validation.ts` concentra la validación compartida de cliente/API y una operación exportada con persistencia inyectable. Valida longitudes mínimas/máximas, email, servicio permitido y normaliza espacios. La API diferencia JSON inválido, errores de campos y fallos de guardado.

El formulario muestra errores junto a los campos, enfoca el primer campo incorrecto, impide duplicar envíos pendientes y conserva lo escrito si falla el servidor o la red. Solo vacía tras confirmar el guardado. Un fallo de analítica no convierte un guardado correcto en error.

## Borradores

La consulta pública por slug exige `published = true` desde el acceso a datos. La página y su Open Graph no deben exponer un borrador. Publicar, editar, despublicar y borrar invalidan listado, categorías, páginas relacionadas, sitemap y las rutas de slug/OG afectadas. Las mutaciones del editor requieren origen de la misma web además de su autorización.

La evolución posterior del blog/editor está coordinada con su agente propietario; los controles anteriores deben conservarse. No se cambió la estructura de la tabla posts para esta corrección.

## Evidencia

Antes de la ampliación de Lab: 9/9 pruebas focalizadas aprobadas en `contact-validation.test.ts`, `public-posts.test.ts` y `recovery-containment.test.ts`. Se ejercita lógica exportada con persistencia inyectada, consulta real SQLite y handlers reales de recuperación. Este resultado es histórico del cierre de la primera parte; la suite global debe volver a comprobar el árbol final.

La revisión de seguridad y código siguió `security-best-practices` y `review-code-high-signal`. No se afirma que un defecto del repositorio se haya verificado explotando la producción.

Smoke posterior por HTTP en `localhost:3010`: forgot devuelve 503, sin `devLink`/token y sin caché; reset devuelve 410; contacto inválido devuelve 400 con errores para nombre, email y mensaje. No se creó ningún mensaje de contacto ni se envió correo en esta comprobación. La revisión posterior confirmó que el evento real `contact_form_submit` coincide con la documentación de medición.
