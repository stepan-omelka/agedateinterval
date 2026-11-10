# API

The Agedate backend: a [Next.js](https://nextjs.org) app with no pages. It has one route handler,
which renders the story image, and in production it also serves the [web](../web/README.md) build
from the same origin.

## ⚙️ How it's wired

- **`GET /api/story/:age`** ([`route.tsx`](./src/app/api/story/[age]/route.tsx)) returns a 1080×1920
  PNG, rendered by `next/og`'s `ImageResponse` from the JSX in
  [`story-image.tsx`](./src/lib/story-image.tsx).
- **Validation**: `:age` must be a canonical whole number (`25`, not `025`, so each age has one URL
  to cache), and the [shared rule](../shared/README.md) must give it a range. Anything else gets a
  `400` in the Problem Details format (`application/problem+json`).
- **Caching**: the response says `public, max-age=86400, s-maxage=31536000`. That holds only while
  the image depends on nothing but the age and the host name; Vercel's CDN keeps it until the next
  deployment. An image that reads a query parameter, a header or the time needs a different header.
- **Serving `web`**: `build:site` builds the Angular app, copies it into `public/`
  ([`copy-web.mjs`](./scripts/copy-web.mjs); `public/` is gitignored) and runs `next build`.
  [`next.config.ts`](./next.config.ts) rewrites `/` to `/index.html` and caches Angular's hashed
  bundles for a year. There is no catch-all fallback, so an unknown path is a 404; `web` would need
  one if it ever gets a router.
- **`../shared` is outside this app.** `turbopack.root` and `outputFileTracingRoot` point at the repo
  root so Turbopack compiles it, and `@shared/*` is mapped in [`tsconfig.json`](./tsconfig.json) and
  [`vitest.config.mts`](./vitest.config.mts).

## 🖼️ The story image

- **Satori is not a browser.** It supports a subset of CSS, and every element with more than one
  child needs `display: flex`. Check the result by eye: open `/api/story/25` (and a wide pair such
  as `/api/story/120`) in the dev server.
- **Fonts**: Inter 500, 700 and 900 as WOFF in [`assets/fonts/`](./assets/fonts) (Satori cannot read
  WOFF2). Only these weights exist in the image. They are read from `process.cwd()` when the module
  loads, and Next.js's output tracing copies them into the function; after moving them, check that
  `.next/server/app/api/story/[age]/route.js.nft.json` still lists them.

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
  and renders a real PNG.
- **Run it from `api/`** (`npm --prefix api test` does), because the fonts are read relative to the
  working directory.
