# API

The Agedate backend: a [Next.js](https://nextjs.org) app with no pages. Its route handlers draw the
story images and the pictures for link previews, and in production it also serves the
[web](../web/README.md) build from the same origin.

## ⚙️ How it's wired

- **`GET /api/story/:age`** ([`route.tsx`](./src/app/api/story/[age]/route.tsx)) returns a 1080×1920
  PNG, rendered by `next/og`'s `ImageResponse` from the JSX in
  [`story-image.tsx`](./src/lib/story-image.tsx).
- **Every image is drawn at build time.** `generateStaticParams` lists the 107 ages that have a
  range, so `next build` renders them all and Vercel serves them as static files: sharing runs no
  function, and a query string cannot force a new render. The handler therefore must not read the
  request; the host name in the footer comes from `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel sets
  and which is unset locally.
- **Validation**: `:age` must be a canonical whole number (`25`, not `025`, which would be drawn
  again at request time), and the [shared rule](../shared/README.md) must give it a range. Anything
  else reaches the function and gets a `400` in the Problem Details format
  (`application/problem+json`).
- **Browsers revalidate** (`max-age=0, must-revalidate`), so after a deployment nobody shares
  yesterday's image.
- **`GET /og-image.png`** (1200×630, for `og:image` in [`web/src/index.html`](../web/src/index.html))
  and **`GET /apple-touch-icon.png`** (180×180) are drawn once at build time too
  (`dynamic = 'force-static'`). A route served at a fixed file name is a folder with that name in
  `src/app/`.
- **Serving `web`**: `build:site` builds the Angular app, copies it into `public/`
  ([`copy-web.mjs`](./scripts/copy-web.mjs); `public/` is gitignored) and runs `next build`.
  [`next.config.ts`](./next.config.ts) rewrites `/` to `/index.html` and caches Angular's hashed
  bundles for a year; `copy-web.mjs` fails the build if Angular's file names stop matching that
  pattern. There is no catch-all fallback, so an unknown path is Next.js's default 404; `web` would
  need one if it ever gets a router.
- **Security headers** on every response are in `next.config.ts`. Which scripts may run is limited
  by the hash-based policy Angular writes into `index.html` (`security.autoCsp` in
  [`web/angular.json`](../web/angular.json)); the header adds `frame-ancestors` and the other
  directives a `<meta>` policy cannot carry. Next.js's own 404 page is not covered by Angular's
  policy, which is why the header sets no `script-src`.
- **Functions run in Frankfurt** (`regions` in [`vercel.json`](./vercel.json)), next to the
  visitors; on Hobby a project gets one region.
- **`../shared` is outside this app.** `turbopack.root` and `outputFileTracingRoot` point at the repo
  root so Turbopack compiles it, and `@shared/*` is mapped in [`tsconfig.json`](./tsconfig.json) and
  [`vitest.config.mts`](./vitest.config.mts).

## 🖼️ The story image

- **Satori is not a browser.** It supports a subset of CSS, and every element with more than one
  child needs `display: flex`. Check the result by eye: open `/api/story/25` (and a wide pair such
  as `/api/story/120`) in the dev server.
- **Fonts**: Inter 500, 700 and 900 as WOFF in [`assets/fonts/`](./assets/fonts) (Satori cannot read
  WOFF2), loaded in [`brand.tsx`](./src/lib/brand.tsx) with the shared gradient and heart. Only
  these weights exist in the images. They are read from `process.cwd()`, so the build must run in
  `api/`; the function still bundles them (output tracing) for the rare render at request time.

## 💻 Development

```sh
npm --prefix api run dev        # next dev on :3400; `npm run dev` at the root adds web
npm run build && npm start      # from the root: the production site, web included, on :3400
npm --prefix api run lint       # ESLint with eslint-config-next
```

- Next.js 16 differs from older versions: read the docs in `node_modules/next/dist/docs/` before
  using an API from memory. `RouteContext<'/api/…'>` is a generated global type, and `params` is a
  `Promise`.
- Keep `next` and `eslint-config-next` on the same version.
- [`vercel.json`](./vercel.json) holds Vercel's install and build commands; the project's Root
  Directory is `api`. See [`ARCHITECTURE.md`](../ARCHITECTURE.md#️-deployment).

## 🧪 Testing

Unit tests on Vitest in Node, as `*.test.ts` beside the source; the
[testing strategy](../docs/testing-strategy.md) has the principles.

```sh
npm --prefix api test
```

- **This runner also runs `shared/`'s tests**: [`vitest.config.mts`](./vitest.config.mts) sets `dir`
  to the repo root and includes `shared/**/*.test.ts`.
- **A route test calls `GET` directly**, with a `Request` and `{ params: Promise.resolve({ age }) }`,
  and renders a real PNG. `vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', …)` draws the production
  footer.
- **Run it from `api/`** (`npm --prefix api test` does), because the fonts are read relative to the
  working directory.
