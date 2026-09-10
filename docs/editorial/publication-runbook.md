# Publicación limitada de las catorce piezas

La actualización completa está autorizada por el usuario. Esta herramienta prepara y aplica únicamente las ocho revisiones y las seis altas de este paquete; nunca importa la fixture de QA, crea usuarios ni ejecuta seeds. Las acciones remotas las realiza el coordinador de la entrega. Crear la herramienta y aprobar sus pruebas locales no significa que los textos ya estén publicados.

## Baseline contrastado

`publication-manifest.json` fija los hashes de las catorce piezas aprobadas y de cinco campos de cada artículo histórico: título, extracto, cuerpo, categoría y minutos de lectura.

Los ocho cuerpos históricos de `publicQaPosts`, renderizados con el conversor anterior de Latech, coinciden **exactamente** con el HTML público guardado en la auditoría del 10 de septiembre de 2026. También se contrastaron H1, descripción completa, categoría y minutos de lectura. El manifiesto conserva el hash del HTML auditado y del cuerpo renderizado; no se presupone que cualquier seed equivalga a producción.

Al ejecutar el plan, cualquier diferencia entre esos cinco campos actuales y el baseline detiene la operación. Una revisión ajena, un borrador o una colisión de una de las seis nuevas URLs tampoco se reemplaza. El informe identifica únicamente slug y campos en conflicto; no imprime cuerpos, secretos ni datos privados.

## Secuencia de entrega

1. Completar el respaldo general y conservar la versión anterior del código según el procedimiento de release.
2. Ejecutar `plan` con un archivo privado de credenciales y el hostname verificado de esa base. Revisar su resultado, que debe indicar ocho actualizaciones y seis altas.
3. Ejecutar `apply` utilizando el mismo archivo, hostname, snapshot y hash exacto que produjo el plan. El usuario ya autorizó la actualización: no hay una aprobación editorial adicional oculta en el formato Markdown.
4. Ejecutar `verify` con el recibo. Debe devolver `all-14-posts-match-receipt`.
5. **Construir y desplegar la aplicación después de aplicar las filas.** Las consultas de `src/lib/posts.ts` usan Drizzle sin Data Cache persistente adicional: el nuevo build genera artículos, relacionadas, categorías, Open Graph y sitemap con el contenido actualizado. Si se aplica después de un build ya generado, habrá que construir y desplegar de nuevo. El script no puede ejecutar `revalidatePath` fuera del servidor Next y no introduce un endpoint de invalidación.
6. Comprobar en producción las ocho URLs conservadas y las seis altas, las herramientas enlazadas, `/blog` y `/sitemap.xml`. No declarar la entrega editorial publicada basándose solo en una escritura de DB.

## Comandos

Sustituir `VERIFIED_DATABASE_HOST` por el hostname previamente comprobado de producción. El archivo de ejemplo debe contener solo `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`; sus valores nunca se ponen en argumentos ni salida. El directorio de respaldo debe existir y ser privado.

```sh
npx tsx scripts/publish-editorial.ts plan \
  --env-file backups/release/.database.env \
  --expected-host VERIFIED_DATABASE_HOST \
  --snapshot backups/release/editorial-before.json

npx tsx scripts/publish-editorial.ts apply \
  --env-file backups/release/.database.env \
  --expected-host VERIFIED_DATABASE_HOST \
  --snapshot backups/release/editorial-before.json \
  --snapshot-sha256 REPLACE_WITH_PLAN_HASH \
  --receipt backups/release/editorial-receipt.json

npx tsx scripts/publish-editorial.ts verify \
  --env-file backups/release/.database.env \
  --expected-host VERIFIED_DATABASE_HOST \
  --receipt backups/release/editorial-receipt.json
```

El plan imprime únicamente estado, cantidades y hashes. No hay carga automática de `.env` ni uso de credenciales heredadas. Se rechazan archivos que no sean 600, enlaces simbólicos, claves ajenas, valores enmascarados, otro host o una URL con usuario, contraseña, puerto, consulta o ruta adicional. Los archivos nuevos se crean con exclusividad: nunca se sobrescribe un snapshot o recibo previo.

## Garantías y recuperación

`plan` solo consulta los catorce slugs. El snapshot conserva las ocho filas completas, incluidos ID, autor, portada, estado y fecha original conocida o NULL. `apply` toma una transacción de escritura y vuelve a comparar las catorce direcciones contra ese snapshot **antes de modificar datos**. Un cambio concurrente o una nueva colisión aborta toda la operación.

Las ocho revisiones cambian únicamente título, extracto, cuerpo, categoría y lectura estimada. Mantienen ID, slug, autor, portada, publicación y fecha histórica. Las seis altas reciben UUID propio y el instante real de inserción; no heredan fechas de la fixture ni afirman un `dateModified` inexistente.

El recibo se escribe con permiso 600 y sincronización del archivo y su directorio antes de la primera escritura. Contiene las filas finales previstas y las rutas que necesitan regeneración. Si falla una actualización o inserción, se revierte la transacción completa. Se rechazan triggers no revisados sobre `posts` para evitar efectos laterales desconocidos.

Ante `COMMIT_UNCERTAIN_VERIFY_RECEIPT`, **no repetir la importación a ciegas**: verificar el recibo contra las catorce filas actuales. Un recibo coincidente acredita que se aplicó; uno diferente exige inspeccionar el snapshot, el recibo y las filas antes de decidir. Un segundo `apply` con el snapshot original aborta tras una aplicación correcta. El recibo conserva deliberadamente `prepared-before-write`: el estado del disco por sí solo no confirma el commit.

Para una reversión editorial, el snapshot aporta las ocho filas anteriores y el recibo identifica exactamente las seis altas. Una restauración selectiva debe comparar primero el estado actual contra el recibo y evitar deshacer cambios editoriales posteriores. No se debe restaurar la base completa solo por un problema de contenido si hay nuevas operaciones ajenas desde el respaldo.

## Pruebas locales

Siete pruebas con bases SQLite temporales reales: guardas de destino y credenciales, alcance exacto, plan sin escritura, preservación de campos y fechas NULL, altas con fecha real, deriva respecto a la auditoría, colisión de borrador, modificación entre plan y apply, rechazo de otro destino y rollback de las ocho actualizaciones cuando falla una inserción posterior. También se comprueba que un fallo al guardar el recibo deja las filas intactas y que una pieza ajena permanece intacta. Pruebas y lint focal aprobados; no se abrió una conexión remota desde este módulo durante su desarrollo.
