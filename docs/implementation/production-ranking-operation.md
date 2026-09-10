# Respaldo y esquema aditivo de producción

Preparado el 10 de septiembre de 2026 tras la instrucción de publicar directamente en producción. El coordinador conserva la versión anterior y ejecuta las operaciones externas. Esta preparación y sus pruebas locales no afirman que la migración ya se haya aplicado.

## Cambio necesario

Frente a `541870b`, Drizzle añade solo `escape_runs`, `escape_results` y tres índices explícitos: `escape_runs_category`, `escape_runs_expiry` y `escape_results_order`. Las claves primarias también generan sus índices internos de SQLite. No cambia ninguna columna de usuarios, posts, contactos, pedidos o cursos. El ranking legado se conserva si existe. Las demás experiencias del Lab no necesitan nuevas tablas.

El único DDL admitido es `scripts/sql/escape-ranking-v2.sql`, fijado por SHA-256 `fe6e0438ac3521486169c91e7bf32cf2a459344b5f7e052e61081eeacba6f723`. No se ejecutan `db:push`, semillas, fixtures, inicializadores QA, ni se importan posts. La publicación editorial tiene su propia operación y comparación de filas.

## Comando del coordinador

```sh
npx tsx scripts/backup-and-apply-escape-ranking.ts \
  --env-file /ruta/privada/.database.env \
  --expected-host HOST_EXACTO.turso.io \
  --backup-dir /ruta/privada/respaldo-nuevo \
  --apply-escape-ranking-v2
```

Sustituir los marcadores con el destino verificado por el coordinador. El archivo es 0600 y su directorio 0700, ambos del usuario actual y sin symlinks. El directorio de respaldo debe ser nuevo y tener un padre privado 0700; nunca se sobreescribe un respaldo. No poner credenciales en argumentos. `dotenv.parse` lee únicamente el archivo seleccionado, toma `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` y no ejecuta shell ni modifica el entorno. Alternativa: `--credentials-file` con JSON privado que contenga solo `databaseUrl` y `authToken`.

Sin `--apply-escape-ranking-v2`, el comando solo realiza el respaldo y la restauración de verificación. Una única ejecución con el flag hace ambas fases en orden y evita duplicar el respaldo. No lee variables de base heredadas, no crea usuarios, no envía correos y no toca Blob, Stripe ni Vercel.

## Garantías verificadas en código

1. Valida URL `libsql:` y coincidencia exacta del host Turso, incluidos dominios regionales; rechaza usuario, contraseña, puerto, ruta extra, query o fragmento. Comprueba el hash del DDL antes de abrir una conexión.
2. Lee esquema, integridad, versiones, claves foráneas y todas las filas en una sola transacción `read`. Conserva enteros de 64 bits con `intMode: bigint`, blobs, rowids, secuencias AUTOINCREMENT y columnas ordinarias; las columnas generadas se regeneran al restaurar. Rechaza tablas virtuales o nombres que oculten rowid: no inventa una copia parcial como si fuera completa.
3. Cierra ese snapshot y lo restaura en `snapshot.db`, archivo local 0600 dentro de un directorio 0700. Crea triggers después de insertar filas, para no ejecutarlos durante la carga. Comprueba `PRAGMA integrity_check`, esquema, metadatos, estado de claves foráneas y hash de cada fila de todas las tablas. No requiere que una base histórica no tenga ninguna infracción previa de clave foránea: exige conservar exactamente ese estado y registra su recuento privado.
4. Sincroniza el archivo y guarda `snapshot-manifest.json` 0600 con SHA-256, intervalo de lectura, inventario y resultados de restauración. Es una copia SQLite restaurada y comprobada localmente; no acredita una restauración remota ni incluye objetos externos de Blob.
5. Solo después abre una transacción `write` (`BEGIN IMMEDIATE`). Toma una nueva lectura antes del DDL y coteja las tablas/índices v2 ya presentes contra el esquema revisado. Una definición existente diferente bloquea la operación; `IF NOT EXISTS` no se usa para ocultar deriva.
6. Aplica el SQL fijado y compara antes/después dentro del mismo bloqueo: todas las filas de tablas preexistentes, objetos del esquema, versiones y estado de claves foráneas deben permanecer iguales. Las adiciones solo pueden ser las dos tablas y tres índices previstos; las tablas nuevas deben estar vacías. Las escrituras legítimas recibidas entre el respaldo y este bloqueo se conservan y quedan incluidas en la comparación, aunque el respaldo representa el punto anterior.
7. Guarda y sincroniza `migration-verification.json` antes del commit y `migration-committed.json` después de su confirmación. El primer archivo por sí solo no prueba que hubo commit. Ante un fallo anterior intenta rollback; ante pérdida de confirmación devuelve `COMMIT_STATUS_UNKNOWN` y exige inspección de lectura antes de reintentar. Nunca borra, restaura ni reintenta automáticamente producción.

El snapshot se mantiene en memoria mientras se restaura y los resultados se obtienen en lotes de lectura. Una base demasiado grande, un timeout del proveedor, una definición no compatible o una restauración fallida detienen la operación antes de aplicar DDL; no se sustituye por un respaldo sin consistencia. La transacción de escritura bloquea brevemente otros escritores durante las verificaciones y el DDL. El coordinador debe comprobar el resultado real y la disponibilidad del ranking tras desplegar.

## Pruebas locales

`npx tsx --test tests/production-ranking-release.test.ts` verifica contra SQLite real: rechazo antes de conectar; respaldo y restauración de enteros grandes/blobs/rowids/secuencias/views/triggers; modo sin DDL; aplicación aditiva y repetición compatible; deriva de esquema; snapshot consistente con otra conexión escribiendo; preservación de esa escritura concurrente al migrar; rollback tras una mutación inyectada; y commit confirmado por el servidor pero con respuesta perdida. No utiliza las credenciales ni la base de producción.

Los respaldos contienen datos privados. Se conservan fuera de Git y no se adjuntan al PR ni a logs. No se debe restaurar la copia completa como rollback habitual: la recuperación de código conserva las tablas y las nuevas filas. Véase `release-runbook.md` para la recuperación selectiva.
