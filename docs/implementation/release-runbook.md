# Orden de entrega y recuperación de Latech

Preparado el 10 de septiembre de 2026. Este documento no ejecuta ni autoriza cambios de producción. La preparación y el aislamiento de Preview están descritos en `preview-readiness.md`; aquí se define cómo publicar una versión validada y recuperarse sin restaurar por defecto una base antigua.

## Referencias y condiciones de salida

- Base Git comprobada: **`541870b15afaa7ba3392020acd7f229c408d35d7`**. La inspección histórica de Vercel no entregó SHA, pero una consulta posterior al conector GitHub confirmó que el estado combinado de ese commit incluye contexto `Vercel`, estado `success` y enlace al [deployment 4iEdVcWEf9mCqijM79fvX4d1tMqK](https://vercel.com/latech767-8157s-projects/latech/4iEdVcWEf9mCqijM79fvX4d1tMqK). Es la evidencia de asociación disponible; volver a comprobar el deployment que esté en producción justo antes de actuar.
- Antes de actuar, registrar en la entrega: SHA final revisado, URL e ID de la Preview comprobada, resultado de QA sobre esa misma versión, ID/URL/SHA del deployment de producción que se sustituirá y destino exacto de la base. El coordinador completa estas referencias; una rama con cambios locales no sustituye ese registro.
- Obtener autorización específica para el destino de producción, el cambio de esquema y la publicación de código. La publicación de las 14 piezas editoriales es una decisión posterior y separada. La preparación de una Preview y los scripts de fixture no autorizan copiarla a producción.
- La definición actual de Drizzle añade únicamente `escape_runs`, `escape_results` y sus cuatro índices. No cambia las columnas de posts, usuarios, pedidos o contactos. El archivo de aplicación acotado es `scripts/sql/escape-ranking-v2.sql`.

## Preparar una copia recuperable

1. Registrar versión y configuración por nombres/scopes, sin volcar secretos en informes. Conservar el deployment anterior y una versión de recuperación revisada antes de promover la nueva web.
2. Con el destino autorizado, obtener una copia consistente de la base y registrar instante, esquema, recuentos y verificación de integridad. Probar su restauración en un recurso aislado antes de considerarla recuperable. Verificar posts, contactos, usuarios/pedidos/cursos, ranking legado y, si ya existen, las tablas v2. No usar los datos restaurados para correos, pagos ni integraciones reales.
3. Elegir un mecanismo consistente confirmado para el proveedor/plan real. El script existente `scripts/backup-turso.ts` realiza lecturas sucesivas sin una transacción de lectura común y escribe con permisos por defecto: **no acredita por sí solo un snapshot consistente bajo escrituras concurrentes**. No ejecutarlo como garantía de recuperación sin resolver y comprobar esas propiedades. Una copia lógica debe mantener un mismo snapshot para esquema y filas; una copia nativa del proveedor también requiere verificación de restauración.
4. Guardar el respaldo y su inventario en ubicación privada, excluida de Git, con directorio0700 y archivos0600. No adjuntar filas, credenciales, enlaces de recuperación o dumps al PR. Conservar por separado los archivos externos de Blob que se vayan a modificar: un dump SQL no contiene sus objetos.
5. Antes de cualquier cambio editorial posterior, obtener además una copia por ID/slug de las ocho filas que se sustituirán, incluyendo contenido, metadatos, estado y fecha, y registrar sus valores/hash de comparación. Así puede revertirse una pieza sin tocar contactos o rankings recibidos después.

## Publicar esquema y código

1. **Esquema primero.** Comprobar en el destino autorizado si existen las tablas/índices v2 y cotejar su forma real con el SQL revisado. `IF NOT EXISTS` no corrige una tabla incompatible. Si existe deriva, detener esta aplicación y preparar un cambio específico; no borrar/recrear para hacer coincidir el esquema.
2. Aplicar solamente `scripts/sql/escape-ranking-v2.sql` dentro de una transacción de escritura del destino explícito. No ejecutar `db:push`, `db:seed`, `seed.ts`, `qa:prepare` ni el inicializador de base QA sobre producción. No mezclar cambios Stripe/cursos ni importar la fixture de76/82 posts.
3. Verificar tablas, columnas, checks, índices, clave foránea `escape_results.run_id → escape_runs.id`, integridad y conservación de los registros anteriores. Si falla antes del commit, rollback de esa transacción. Ante una respuesta incierta del commit, inspeccionar el estado real antes de reintentar. La aplicación anterior puede seguir usando `escape_scores` mientras las tablas nuevas estén vacías.
4. **Código después.** Promover el artefacto cuyo SHA y configuración se revisaron. Verificar HTTP/metadata/sitemap, contacto, recuperación asistida, ocultación de borradores y estado del ranking. Las pruebas con escrituras deben usar recursos o identidades de QA autorizados expresamente; no enviar contactos, mensajes, cobros o recuperaciones reales por rutina.
5. La respuesta de almacenamiento no disponible debe tratarse como fallo del ranking, no como una clasificación vacía. Si faltan tablas, las APIs v2 no las crearán por sí solas. El juego local puede seguir disponible, pero no se declara listo el ranking hasta comprobar el destino real.
6. Registrar el resultado inmediato y revisar errores de servidor y recorridos clave con observaciones acotadas. No atribuir visitas/ventas a la entrega sin datos posteriores comparables.

## Publicar contenido en una operación separada

Los documentos de `docs/editorial` son ocho revisiones de URLs existentes y seis altas propuestas. El flag editorial de QA solo prepara una vista de revisión y nunca equivale a publicación en producción.

Después de aceptar cada pieza y comprobar que sus herramientas/enlaces estén desplegados: comparar la fila actual con la copia aprobada; abortar si otra persona la ha editado. Actualizar las ocho por su ID/slug original, preservando fechas conocidas y null cuando no se conoce la fecha. Crear las seis sin colisiones ni notas internas y registrar la fecha real de publicación solo cuando esté respaldada. El editor actual no inventa una fecha al publicar un borrador antiguo de fecha desconocida.

Usar el editor/API autorizado para conservar sus validaciones y la invalidación de blog, categorías, sitemap, artículo y OG. Verificar contenido, enlaces, imagen social, estado y canonical después de cada lote. No copiar una base QA completa ni ejecutar semillas históricas para publicar estas piezas. Conservar el registro de qué filas cambiaron y de sus valores antes/después.

## Recuperación sin pérdida de datos

**Preferencia: revertir el módulo que falla conservando las contenciones y los contratos activos.** Mantener las correcciones de recuperación (`forgot` asistido, reset legacy retirado), el filtro de borradores públicos/OG y la invalidación de caché. Si ya se publicaron tablas/artículos, conservar también el renderizador compatible y las rutas usadas por enlaces públicos. Verificar la versión de recuperación en QA antes de promoverla.

Un rollback íntegro al código `541870b` **no es una recuperación segura por defecto**: esa versión devuelve `devLink` desde `/api/auth/forgot` y consulta posts por slug sin exigir `published=true`. Volvería a introducir defectos conocidos. Si se necesita recuperar su aspecto/comportamiento, construir una variante sobre esa base que conserve las contenciones revisadas y los contratos necesarios, con SHA y comprobaciones propios; no promover ciegamente un deployment antiguo.

| Datos o contrato | Qué hacer durante la recuperación |
| --- | --- |
| `escape_runs` y `escape_results` | Conservar tablas y filas. No DROP, TRUNCATE ni limpieza de sesiones: borrar runs puede borrar sus resultados por cascada. La versión vieja ignora v2 y mostraría el ranking legado; los datos seguirían presentes, pero no visibles en esa interfaz. Mantener APIs v2 y cliente compatible para partidas/reintentos en curso; las credenciales activas expiran a los60 minutos y los resultados aceptados permiten reintentos idénticos posteriores. |
| `escape_scores` legado | Conservar sin mezclar con puntuaciones de reglas v2. No convertir puntos antiguos como si fueran de la misma competición. |
| Posts recibidos o editados después de la entrega | No restaurar toda la tabla ni toda la base. Revertir solo la pieza indicada si sigue coincidiendo con la versión que se pretende deshacer; conservar ediciones posteriores. Las seis nuevas pueden retirarse del público conservando su fila e historial operativo, con estrategia de URL explícita si ya se compartieron. Mantener las guardas de borrador y revalidar caches. |
| Contactos, pedidos, cuentas y cursos | Conservar sus filas actuales. Un rollback de código no necesita sustituirlas por un respaldo anterior; hacerlo perdería entradas recibidas entre ambos momentos. Verificar que la versión recuperada sigue usando el mismo destino y esquema compatible. |
| Nuevas rutas `/lab/*` y `/briefing` | Evitar eliminarlas durante una reversión selectiva: los enlaces compartidos y artículos pueden estar en circulación. Mantener una versión compatible o un destino revisado que conserve su finalidad. |

Restaurar una base antigua queda reservado a una recuperación de datos específicamente diagnosticada y autorizada, con reconciliación de todas las escrituras posteriores. No es el procedimiento de rollback de esta entrega aditiva. Si se produce una incidencia, primero conservar evidencia y el estado actual; después decidir una corrección hacia delante o una reversión selectiva. La copia de seguridad es una última vía de recuperación, no una razón para sobrescribir datos recientes.

No se ha aplicado este runbook en producción, probado una restauración remota ni verificado un rollback real. Los pasos anteriores son la operación propuesta y sus condiciones verificables.
