# Reproducible local QA

Use Node24 and the committed lockfile. No production credentials are needed:

```sh
npm ci --no-audit --no-fund
npm run qa:prepare
npm run lint
npm test
npm run typecheck
npm run build
npm run start -- --port 3010
```

`typecheck` runs `next typegen` before TypeScript, so a clean checkout includes the generated Next.js route and asset types without depending on a previous build. Local screenshots and Lighthouse reports are ignored; selected public previews and verification summaries are versioned under `docs/implementation`.

`qa:prepare` only opens `.local/qa.db` and exports the schema without contacting a database server. It adds all 76 historical public posts and an unpublished fixture (`qa-private-draft`), never customer accounts. The shared `public-qa-posts.ts` reads the 16 legacy inline articles by TypeScript AST, allowing only literal public fields; it never imports or executes `seed.ts`. The other 60 come from the nine public batches. It creates `.env.local` only if absent. An existing developer configuration is preserved: check its target before running Next. The preparation script ignores TURSO environment variables.

An optional review dataset is available with `npm run qa:prepare -- --editorial-preview`. This explicitly applies the eight editorial replacements and six new drafts as publicly readable **local QA examples**, for 82 total. It excludes frontmatter/notes and the duplicate body H1, preserves IDs and dates of existing rows, and leaves the six new entries without a publication date. The other historical rows and private QA draft are not updated. A later normal `qa:prepare` remains insert-only: it does not silently undo an explicitly enabled editorial preview or delete its six additions. Neither mode publishes to production; use a separate fresh fixture if comparing the historical dataset again.

The GitHub Actions quality workflow explicitly uses this editorial preview flag in a fresh local fixture, so its build covers all 82 public QA articles. Unit tests separately verify the historical 76-post baseline and the optional transformation.

New game tables can be added to an existing local fixture with `./node_modules/.bin/tsx scripts/prepare-escape-ranking.ts`. This script refuses remote databases; do not use `db:push` for QA. A fresh fixture includes all current Drizzle tables.

Unit tests use a harmless CSS-module stub only when importing pages for metadata. CSS rendering, mobile sizing and interaction require real browser checks. Check at320/390/768/820/1024/1440px, keyboard, reduced motion, reload, blocked storage and incomplete or rejected submissions. Use local fixtures or intercepted writes. Never submit to production contacts, billing, rankings or accounts.

The repository's quote catalog is distinct from legacy Stripe billing contracts. The public calculator creates a WhatsApp draft; it never charges, registers or sends a message automatically. Verify the encoded link's recipient and full text without opening or sending to WhatsApp during automated QA.

The reset endpoints intentionally do not issue tokens until a verified email delivery channel is implemented. `/recuperar` offers assisted recovery. Real assistance still requires the owner to verify identity; a WhatsApp request is not identity verification.

For authenticated browser/API checks, optionally run `./node_modules/.bin/tsx scripts/prepare-local-qa-users.ts`. It only opens the fixed `.local/qa.db`, requires the unpublished QA marker, and creates two fictitious accounts. Generated credentials stay in ignored `.local/qa-users.json` with mode600 and are not printed. Never copy those credentials to an external environment.

With the local server on port3010, `./node_modules/.bin/tsx scripts/smoke-editor.ts` checks real credentials auth, client/admin authorization, dashboard, draft body/OG concealment, private editor, slug collision, publication, stable URLs and withdrawal. It deletes only the temporary article it created. The script has a fixed loopback origin and does not read any production configuration.
