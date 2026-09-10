# Preview Vercel operativa: estado y siguiente acción

Investigación de solo lectura, 10-09-2026. **La opción compatible y más corta es una base Turso nueva y exclusiva de QA, conectada únicamente a Preview, con un secreto Auth.js independiente.** No hace falta iniciar sesión en el CLI de Turso: la integración Turso Cloud ya está instalada en la cuenta Vercel y permite provisionar recursos. No se ha creado ni conectado nada durante esta investigación.

## Estado verificado

- El árbol local suspende temporalmente el despliegue Git automático solo de `codex/latech-evolution-2026-09-10` mediante una única clave false en `vercel.json`. La comparación del JSON contra HEAD confirma que se preservan cron y demás ajustes, sin comodín true. Push/PR y GitHub Actions siguen habilitados; `main` no está bloqueado. La CLI permite desplegar Preview después de configurar QA. Retirar esa clave cuando QA externa esté lista. No se ha cambiado la cuenta ni lanzado un deployment; detalles y fuentes en [comportamiento de Git/Preview](./git-preview-behavior.md).
- Vercel CLI 59.11.7 autenticado como `latech767-8157`; worktree vinculado al proyecto `latech`, framework Next.js, Node 24.x, build `npm run build`/`next build`.
- `vercel env ls`: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET` y `NEXTAUTH_SECRET` existen en Development/Production, **no en Preview**. No se descargaron sus valores ni se abrieron archivos de credenciales.
- Preview **sí comparte** una variable `BLOB_READ_WRITE_TOKEN` con Production/Development y `CRON_SECRET` con Production. No basta con aislar la base: esas conexiones también deben separarse antes de probar subidas o limpieza.
- `turso auth whoami`: no autenticado. `vercel integration installations --format=json`: Turso Cloud instalado, plan `starter` activo, $0/mes, sin método de pago requerido y capacidad de aprovisionamiento. `integration list` del proyecto y `--all --integration tursocloud` no enumeran recursos disponibles para reutilizar; no se presume que una base desconocida sea de pruebas.
- La ayuda del CLI ofrece `--plan starter`, región `dub1`, `--environment preview` y `--no-env-pull`. El valor por defecto de entornos es **todos**: hay que indicar Preview expresamente. El catálogo oficial confirma las mismas variables `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` que usa este repo. [Turso Cloud en Vercel](https://vercel.com/marketplace/tursocloud), [CLI de integraciones](https://vercel.com/docs/cli/integration).

## Por qué desplegar sin DB no resuelve el problema

`src/lib/db.ts` crea el cliente al importar el módulo. La comprobación aislada con la versión instalada y `url: undefined` produce `LibsqlError: URL_INVALID`; no contacta ningún servicio. Blog, sitemap, auth y varias APIs importan ese módulo. Los `try/catch` dentro de consultas no cubren ese fallo previo de importación. Es un bloqueo de configuración del árbol actual; no se ha ejecutado un build completo sin variables para repetirlo.

Auth.js usa credenciales contra `users` y requiere un secreto. Su versión instalada acepta `AUTH_SECRET` y puede inferir la URL desde la petición. No copiar `NEXTAUTH_URL` de producción: ese ajuste reemplaza el origen de la petición en Auth.js. `trustHost: true` ya está declarado. [Despliegue de Auth.js](https://authjs.dev/getting-started/deployment).

Subir `.local/qa.db`, usar `:memory:` o escribir en `/tmp` no proporciona persistencia compartida entre funciones Vercel: ranking, contactos y cuentas se perderían o divergirían. Esa alternativa no sería una preview funcional. [SQLite y almacenamiento local en Vercel](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel).

Una variante sin DB exigiría cambios explícitos para mostrar indisponibilidad en blog/editor/contacto/ranking/auth; permitiría revisar parte del diseño, pero no cumple «versión completa». Conectar Supabase/Neon tampoco es un reemplazo directo: este esquema y cliente son SQLite/libSQL.

## Secuencia concreta tras autorización

1. Crear una base nueva de QA en la integración existente. Comando preparado, **no ejecutado**:

   ```sh
   vercel integration add tursocloud --name latech-qa-evolution-20260910 --plan starter --metadata region=dub1 --environment preview --no-env-pull
   ```

   Verificar que solo añade variables a Preview. El recurso será común a las previews de este proyecto; si se quiere aislamiento por rama, crear con `--no-connect` y configurar después variables específicas de esa rama. No reutilizar valores de producción.

2. Generar `AUTH_SECRET` independiente y configurarlo solo en Preview. Preparar en la base nueva el **esquema completo** de `drizzle/schema.ts`, incluidas `escape_runs`/`escape_results`, y contenido público/de prueba. El [inicializador remoto preparado](./remote-qa-initializer.md) comprueba host explícito, base sin esquema y una transacción completa; todavía no se ha ejecutado contra Turso. Crear cuentas QA con credenciales nuevas, entregadas de forma privada, es una acción separada: el inicializador no crea usuarios. No usar el antiguo `scripts/seed.ts`, que contiene credenciales por defecto y puede actualizar un administrador existente. Los scripts locales conservan su rechazo de destinos remotos.

3. Sustituir el binding de Blob en Preview por un almacén de pruebas si se van a validar subidas; separar o retirar el `CRON_SECRET` de Preview. Conservar intactos sus scopes y valores de producción. No copiar archivos privados, clientes, candidatos, pedidos ni sus URLs a la base QA.

4. Para validar pagos existentes, usar claves, precios, enlaces y webhook de **Stripe test**. La ausencia de `STRIPE_SECRET_KEY` no convierte toda la tienda en sandbox: `src/lib/stripe-links.ts` contiene enlaces de contratación por defecto usados en `/tienda/web` y `/tienda/online`. Esos enlaces deben sustituirse por enlaces de prueba en la preview antes de probar contratación. El configurador nuevo y su resumen no requieren Stripe. Configurar `NEXT_PUBLIC_APP_URL` con la URL QA cuando se validen retornos de pago.

5. Desplegar con destino Preview, sin `--prod`, sin dominios/DNS ni promoción. Confirmar protección de acceso y no indexación de la preview; la protección por autenticación Vercel está disponible, pero su estado actual no se verificó con `project inspect`. [Protección de despliegues](https://vercel.com/docs/deployment-protection). Después: build, login/admin con cuentas QA, publicar/despublicar un post de prueba, contacto, ranking, subidas y pagos test según las conexiones configuradas. Todo escrito debe quedar en recursos QA.

## Autorización mínima que falta

Autorizar **crear una base Turso Cloud Starter nueva en la cuenta Vercel, configurarla y sembrar exclusivamente datos de QA, añadir secretos exclusivos de Preview y desplegar esa preview**. Para llamarla completamente aislada, incluir la separación de Blob/cron en Preview y, si se probarán pagos, la configuración de Stripe test. No incluye migrar, copiar credenciales, modificar datos, desplegar, cobrar ni enviar correos en producción.

Si no se quiere modificar el entorno Preview compartido del proyecto actual, la alternativa es un proyecto Vercel de QA separado con esos mismos recursos de pruebas; requiere crear otro proyecto, pero evita heredar Blob/cron actuales. La recuperación de cuenta seguirá siendo asistida de manera explícita, tal como está implementada, hasta disponer de un proveedor de correo autorizado.
