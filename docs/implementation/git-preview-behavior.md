# Qué se espera al publicar la rama en GitHub

Comprobación de solo lectura y ajuste local revisado, 10 de septiembre de 2026, antes del push de la rama `codex/latech-evolution-2026-09-10`. No se cambió la integración de la cuenta ni se lanzó un deployment para probarlo.

## Configuración observada

- La API autenticada de Vercel identifica el proyecto `latech` (`prj_9UWOA07aNokytyJ9KMrETbrGPwte`) enlazado a GitHub `Andreh33/jaja`, con rama de producción `main`.
- `commandForIgnoringBuildStep` es null; `buildCommand` y `rootDirectory` también son null, con preset Next.js. La respuesta incluye `gitProviderOptions.createDeployments = enabled` y comentarios de PR habilitados; no se modificaron esos campos de cuenta.
- El árbol local ahora declara exclusivamente `git.deploymentEnabled["codex/latech-evolution-2026-09-10"] = false`. La comparación del JSON con `HEAD:vercel.json` confirma que esta es la única configuración añadida y que el cron se conserva. No hay regla `*` ni otra clave de rama.
- `vercel env ls preview`, filtrado para mostrar solo nombres, devuelve `CRON_SECRET` y `BLOB_READ_WRITE_TOKEN`. Preview sigue sin `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET` o `NEXTAUTH_SECRET`. No se leyeron ni imprimieron sus valores.
- `.env.local`, `.local/qa.db` y `.vercel/project.json` no están versionados. La fixture local no viaja con el push.
- El estado combinado de GitHub del commit base `541870b15afaa7ba3392020acd7f229c408d35d7` contiene `Vercel: success` y enlaza al [deployment 4iEdVcWEf9mCqijM79fvX4d1tMqK](https://vercel.com/latech767-8157s-projects/latech/4iEdVcWEf9mCqijM79fvX4d1tMqK). La integración ha producido al menos ese resultado; esto no constituye una prueba de un futuro push de `codex/**`.

## Comportamiento previsto del árbol que se publicará

La excepción local suspende temporalmente los despliegues automáticos Git de **esta rama exacta**, para evitar un intento con configuración conocida como incompleta. GitHub y su workflow siguen habilitados. `main` y las otras ramas conservan su comportamiento: Vercel establece por defecto true para toda rama no especificada. Si una rama coincide con varias reglas, una regla true permite el despliegue; por eso no se añade un comodín true. [Configuración Git oficial](https://vercel.com/docs/project-configuration/git-configuration).

La suspensión de Git no impide un despliegue manual por CLI. La guía oficial combina `git.deploymentEnabled: false` con despliegues mediante Vercel CLI; el destino Preview se seleccionará sin `--prod`, una vez preparados los recursos QA. Todavía no se ha ejecutado un push ni un deployment para confirmar el evento real de esta rama. [Despliegues mediante CLI con Git deshabilitado](https://vercel.com/kb/guide/can-you-deploy-based-on-tags-releases-on-vercel).

**Se espera que la Preview falle mientras falte la base de datos.** `src/lib/db.ts` llama a `createClient` al importarse y utiliza directamente `TURSO_DATABASE_URL`. El cliente instalado rechaza una URL undefined con `URL_INVALID`, comprobado de forma aislada sin abrir conexión. El build de Vercel ejecuta el build Next del proyecto; no ejecuta el paso de fixture de GitHub Actions. No se ha lanzado un build remoto para afirmar su mensaje final exacto. Aunque se resolviera la URL, la falta de autenticación/base/esquema seguiría impidiendo presentar una aplicación completa y funcional.

El workflow `.github/workflows/quality.yml` es independiente: para PR y pushes a `main`/`codex/**` instala dependencias, prepara una fixture **local al job**, ejecuta checks y construye. Un workflow verde con esa fixture no aprovisiona Turso ni configura Preview en Vercel.

La rama y el PR pueden entregarse para revisión con la preview pendiente. Retirar la única clave de rama cuando QA externa esté configurada y verificada; no requiere cambiar ajustes de cuenta ni bloquear `main`. La acción concreta de aislamiento/provisión necesaria está en `preview-readiness.md` y el inicializador revisable en `remote-qa-initializer.md`.
