# Inicializador de una base QA nueva

Artefacto preparado; **no se ha ejecutado contra Turso ni se han configurado variables Vercel**. Las verificaciones usan exclusivamente SQLite temporal local con el cliente real y el esquema exportado por Drizzle.

## Acción revisable

Después de autorizar y crear el recurso de QA, obtener su URL/token de forma privada y guardarlos como JSON con únicamente las claves `databaseUrl` y `authToken` en `.local/preview-db.json`, permisos 0600. No utilizar `.env.local`, un volcado de producción ni credenciales de otro entorno.

```sh
./node_modules/.bin/tsx scripts/initialize-remote-qa.ts \
  --apply-new-qa-database \
  --database-name latech-qa-evolution-20260910 \
  --expected-host HOST-EXACTO-DEL-RECURSO-NUEVO.turso.io \
  --credentials-file .local/preview-db.json
```

El marcador de host debe sustituirse por el host real del recurso nuevo, en minúsculas y con prefijo `latech-qa-evolution-20260910-`. El script no acepta un host inferido desde variables heredadas. `--help` solo muestra instrucciones; omitir cualquiera de los cuatro argumentos detiene la ejecución sin conexión.

Solo si se incluye explícitamente `--editorial-preview`, el inicializador utiliza 82 artículos de revisión: ocho reemplazos editoriales y seis altas propuestas en lugar del conjunto histórico de 76. El parser excluye notas/frontmatter/H1 y valida tipos, categorías y colisiones. Esta opción no relaja ninguna guarda de destino o base vacía ni autoriza publicar en producción. En la base remota QA nueva las fechas siguen siendo las de inicialización de la fixture; no se presentan como fechas históricas de los seis borradores. Sin ese flag no se carga contenido de `docs/editorial`.

## Guardas y resultado

- Nombre con prefijo obligatorio `latech-qa-`; URL `libsql:` cuyo host debe coincidir exactamente con el argumento y el nombre de la base. Rechaza puertos, credenciales embebidas, query, fragmento y rutas adicionales.
- Exige ejecutar desde la raíz de este mismo repo. Archivo privado obligatorio dentro de `.local`, ignorado por Git, sin symlinks y sin permisos para grupo/otros. Solo acepta URL/token; no lee archivos `.env` ni toma un destino de `process.env`.
- Valida artículos y SQL antes de crear el cliente. Exporta **el esquema actual completo** con `drizzle-kit export --dialect sqlite`; solo acepta instrucciones CREATE TABLE/INDEX, nunca BEGIN/COMMIT/DROP ni datos arbitrarios.
- Abre una transacción de escritura (`BEGIN IMMEDIATE`) y comprueba que no exista ningún objeto de esquema de usuario. Rechaza incluso `users` vacío, cualquier pedido y un esquema de una ejecución previa. El bloqueo evita una carrera entre la comprobación y la creación.
- Crea todas las tablas e índices y carga los 76 artículos públicos históricos incluidos en el repo: 60 de las nueve tandas y 16 de los arrays `seededPosts`/`extraPosts` de la semilla antigua. Estos últimos se leen por AST de TypeScript con campos literales permitidos; nunca se importa ni ejecuta `seed.ts`, sus operaciones de usuarios ni sus expresiones de fecha. Publica esos artículos **en QA** con fecha de inicialización; no altera sus fechas de producción. Usuarios, pedidos y contactos quedan vacíos. No crea cuentas ni contraseñas.
- Un fallo previo al commit solicita rollback y cierra la transacción. Si la respuesta del commit o el rollback es incierta, devuelve `COMMIT_STATUS_UNKNOWN`: exige inspección de esquema/recuentos del recurso QA y no reintenta automáticamente. Una repetición tras un commit efectivo se bloquea por base no vacía.
- Los mensajes de consola incluyen estados/recuentos, nunca el token, URL de conexión completa, contenido editorial ni errores crudos del proveedor.

No usarlo como migrador ni modificar sus guardas para apuntarlo a producción. Los scripts `prepare-local-qa.ts` y `prepare-escape-ranking.ts` conservan su alcance local. Las cuentas necesarias para QA del editor requieren una acción separada sobre esta base; no se ha simulado autenticación.

## Pruebas

`./node_modules/.bin/tsx --test tests/qa-database-initializer.test.ts` comprueba configuración errónea sin abrir conexión; base existente intacta aunque users esté vacío; esquema real y todas las semillas públicas; rollback completo ante fallo de inserción; SQL de control de transacción/datos no editoriales rechazados; y respuesta perdida después de commit sin segunda inicialización. No contacta hosts remotos: el conector de las pruebas está inyectado y crea ficheros SQLite temporales.

Resultado local actualizado: 15/15 pruebas aprobadas (`public-qa-posts.test.ts` + `editorial-preview.test.ts` + `qa-database-initializer.test.ts`) con los 76 artículos históricos, igualdad exacta con las URLs de la auditoría, transformación optativa de 8 + 6, rechazo de expresiones ejecutables en contenido y todas las guardas transaccionales anteriores. `--help` verificado sin conexión y ESLint focal aprobado. La verificación global del árbol corresponde al agente raíz; no se ha probado una transacción remota ni se afirma compatibilidad verificada con un recurso aún no creado.
