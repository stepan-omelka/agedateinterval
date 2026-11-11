# ✨ Instructions for AI agents

- Refer to [`README.md`](./README.md) for what Agedate is and the list of projects.
- Refer to [`ARCHITECTURE.md`](./ARCHITECTURE.md) for how `web`, `api` and `shared` fit together and
  where the app runs.
- Refer to [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the scripts and the Git conventions.
- Refer to [`docs/coding-standards.md`](./docs/coding-standards.md) before writing code,
  [`docs/testing-strategy.md`](./docs/testing-strategy.md) before writing a test and
  [`docs/comments-and-docs-policy.md`](./docs/comments-and-docs-policy.md) before writing a comment
  or a doc.
- Read a project's `README.md` before changing anything in it: [`web`](./web/README.md),
  [`api`](./api/README.md), [`shared`](./shared/README.md). The rules and footguns live there.

## What belongs in an `AGENTS.md`

These files are for **gotchas and hard-to-explore findings**: the things an agent would otherwise
only learn by being burnt.

- **Never** restate what other documentation already says; link to it instead.
- **Never** restate what a single file's own comments state plainly. An agent reading that file
  already has it, and a second copy here is one that will go stale.
- A non-obvious conclusion that only emerges from comments and code scattered across several files
  **is** hard to find, and does belong here.

## Changing the code

Verify changes from the repo root:

```sh
npm run lint          # ESLint: eslint-config-next in api/, angular-eslint in web/
npm test              # Vitest: shared/ and api/, then web/
npm run build         # type checks both apps and builds the site as Vercel does
npm run format:check  # Prettier, including import order
```

- **`npm run build` is the only check of the production wiring**: the Angular build copied into
  `api/public/`, the rewrite of `/`, the images drawn at build time and Angular's script policy.
  Run it after touching `api/next.config.ts`, `api/vercel.json`, `api/scripts/`, `api/assets/` or
  `web/src/index.html`, and check the result in a browser with `npm start` (one origin,
  http://localhost:3400) rather than the dev servers.
- Comments describe the code as it stands, never how it used to look: no "was X, now Y", no "moved
  from Z". **The git history is the record.** The one exception is code that looks wrong but is
  right; there, say what breaks if it is changed back.

**Never commit or push** unless explicitly asked. **A push to `main` deploys to production.** When
you are asked to commit, read [`CONTRIBUTING.md`](./CONTRIBUTING.md#-git) first; the hooks reject a
commit message that doesn't follow it.

## Gotchas

- **The `@shared/*` alias is declared in three places**: `web/tsconfig.json`, `api/tsconfig.json`
  and `api/vitest.config.mts`. On top of that, `api/next.config.ts` points `turbopack.root` and
  `outputFileTracingRoot` at the repo root, without which Turbopack refuses to compile `../shared`.
  A new shared module or a moved folder means checking all four.
- **Three lockfiles, no npm workspaces.** The root, `api/` and `web/` each have their own
  `package.json` and `package-lock.json`, and the root `postinstall` installs the other two. Add a
  dependency with `npm install <package> --prefix <project>`. Vercel installs only `api/` and
  `web/` (`api/vercel.json`), so a root dependency never reaches a production build.
- **The root `package.json` overrides `minimatch`** for `@trivago/prettier-plugin-sort-imports`,
  whose newest release still asks for minimatch 9, which has a denial-of-service advisory
  ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), fixed in 11.0.1). The
  plugin only calls `minimatch()`, which 11 keeps. Drop the override once the plugin asks for 11.
  Don't add the same override for ESLint in `api/` or `web/`: minimatch 11 changed the partial
  matching ESLint uses to find files, so it could lint or skip the wrong ones without an error.
- **The production address is written out in [`web/src/index.html`](./web/src/index.html)**: link
  previews need absolute URLs (`og:url`, `og:image`, the canonical link). A custom domain means
  changing them there.
- **Hosting must stay free.** This is a personal project on Vercel's Hobby plan, which is for
  non-commercial use, needs no card and pauses instead of billing. Don't add a service, an add-on
  or a Vercel feature that needs a payment method.
