# API

The Agedate backend: a [NestJS](https://nestjs.com) application with one endpoint, the story image.
Its build also draws every image the site serves, and puts them with the [web](../web/README.md)
build in `public/`, which Vercel publishes on the same origin as the API.

## ⚙️ How it's wired

- **`GET /api/story/:age`** ([`StoryController`](./src/story/story.controller.ts)) returns a
  1080×1920 PNG. [`DatingRangePipe`](./src/story/dating-range.pipe.ts) turns `:age` into a range,
  [`storyImage`](./src/story/story-image.ts) lays it out and
  [`ImageRenderer`](./src/image/image-renderer.ts) draws it.
- **Modules**:

  | Module            | Holds                                                                 |
  | :---------------- | :-------------------------------------------------------------------- |
  | `AppModule`       | the HTTP application: `StoryModule` and the global error filter       |
  | `StoryModule`     | the endpoint: controller, pipe, `StoryService` and the layout         |
  | `ImageModule`     | `ImageRenderer`: an `ImageNode` tree in, a PNG out                    |
  | `PrerenderModule` | `Prerenderer`, which only the build runs; not part of the `AppModule` |

- **Every image is drawn at build time.** [`prerender.ts`](./src/prerender.ts) starts the
  `PrerenderModule` without an HTTP server and writes the 107 story images, `og-image.png` and
  `apple-touch-icon.png` into `public/`. [`vercel.json`](./vercel.json) rewrites
  `/api/story/<age>` to the file `/api/story/<age>.png`, so the CDN answers a valid age from a
  static file: no function runs, and a query string cannot force a new render, because the CDN
  ignores it for a file. The host name in the footer therefore cannot come from a request; it is
  `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel sets and which is unset locally.
- **That rewrite lists the ages as a pattern**, since `vercel.json` cannot read the rule.
  [`vercel-config.test.ts`](./src/vercel-config.test.ts) fails when the two disagree.
- **Validation**: `:age` must be a canonical whole number (`25`, not `025`, and not `%32%35`:
  [`RawAge`](./src/story/raw-age.decorator.ts) reads the segment before Express decodes it) that
  the [shared rule](../shared/README.md) gives a range. Anything else reaches the function, where
  the pipe throws and [`ProblemDetailsFilter`](./src/problem-details.filter.ts) answers `400` in the
  Problem Details format (`application/problem+json`). The same filter answers an unknown `/api/*`
  path with a `404`.
- **Browsers revalidate** an image (`max-age=0, must-revalidate`, Vercel's default for a file), so
  after a deployment nobody shares yesterday's.
- **On Vercel the application is one function**, [`api/index.ts`](./api/index.ts): Vercel makes a
  function of each file in `<Root Directory>/api/`, here `api/api/`. `vercel.json` rewrites every
  other `/api/*` path to it, and Nest sees the path the visitor asked for.
- **The framework preset is Other** (`"framework": null`), not NestJS: Vercel's NestJS preset
  publishes no static files, and its Express preset collects `public/` before the build command
  has filled it.
- **Serving `web`**: `build:site` builds the Angular app and copies it into `public/`
  ([`copy-web.mjs`](./scripts/copy-web.mjs); `public/` is gitignored), the `outputDirectory` in
  `vercel.json`. `/` is its `index.html`. `vercel.json` caches Angular's hashed bundles for a year;
  `copy-web.mjs` fails the build if Angular's file names stop matching that pattern. There is no
  catch-all fallback, so an unknown path is Vercel's 404; `web` would need one if it ever gets a
  router.
- **Security headers** on every response are in `vercel.json`. Which scripts may run is limited by
  the hash-based policy Angular writes into `index.html` (`security.autoCsp` in
  [`web/angular.json`](../web/angular.json)); the header adds `frame-ancestors` and the other
  directives a `<meta>` policy cannot carry.
- **The function runs in Frankfurt** (`regions` in `vercel.json`), next to the visitors; on Hobby
  a project gets one region.
- **`../shared` is outside this app** and imported by relative path, because Vercel's function
  build does not resolve `paths` from `tsconfig.json`. The root [`AGENTS.md`](../AGENTS.md#gotchas)
  lists the settings that exist for it.

## 🖼️ The images

- **Satori is not a browser.** It supports a subset of CSS, and every element with more than one
  child needs `display: flex`. Check the result by eye: open http://localhost:3400/api/story/25
  (and a wide pair such as `/api/story/120`) in the dev server. `og-image.png` and
  `apple-touch-icon.png` are only drawn by the build; look at them in `public/`.
- **A layout is a function that returns an `ImageNode`**, built with
  [`h()`](./src/image/image-node.ts): the object shape Satori reads, without React or JSX.
- **Fonts**: Inter 500, 700 and 900 as WOFF in [`src/image/fonts/`](./src/image/fonts) (Satori
  cannot read WOFF2). Only these weights exist in the images. `ImageRenderer` reads them relative
  to its own file, so they travel with it: `nest build` copies them into `dist/` (`assets` in
  [`nest-cli.json`](./nest-cli.json)) and `vercel.json` adds them to the function
  (`includeFiles`).
- **Satori, resvg and the fonts load with the first image**, not at startup. A request for an
  invalid age, the only kind the function gets in production, never loads resvg's native binary.

## 💻 Development

```sh
npm --prefix api run dev        # nest start --watch on :3400; `npm run dev` at the root adds web
npm run build && npm start      # from the root: the built site, web included, on :3400
npm --prefix api run lint       # ESLint with typescript-eslint
```

- **`npm start` is not Vercel**: it serves `public/` and draws a story image on request, without
  the rewrites and headers of `vercel.json`. To see what Vercel will do with that file, link the
  project once (`npx vercel link`, then `npx vercel pull`), run `npx vercel build` at the repo
  root and read `.vercel/output/config.json` (the routes, in order), `static/` and `functions/`.
- **The code is ES modules**, as NestJS 12 is: a relative import ends in `.js`, also for a `.ts`
  file. `tsc` compiles `../shared` along, so the output is `dist/api/src/` and `dist/shared/`.
- `npm run build` type-checks everything (`tsc --noEmit`, tests and `api/index.ts` included)
  before `nest build` compiles `src/`.

## 🧪 Testing

Unit tests on Vitest in Node, as `*.test.ts` beside the source; the
[testing strategy](../docs/testing-strategy.md) has the principles.

```sh
npm --prefix api test
```

- **This runner also runs `shared/`'s tests**: [`vitest.config.ts`](./vitest.config.ts) sets `dir`
  to the repo root and includes `shared/**/*.test.ts`.
- **An endpoint is tested over HTTP**: `Test.createTestingModule({ imports: [AppModule] })`, then
  [supertest](https://github.com/forwardemail/supertest) against `app.getHttpServer()`. The
  controller tests render real PNGs; `vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', …)` draws the
  production footer.
- **Replace `ImageRenderer` when the pixels don't matter**
  (`.overrideProvider(ImageRenderer).useValue(…)`, as in the `Prerenderer` test): a story image
  takes about half a second to draw.
- **Vitest compiles the decorators itself** and reads `experimentalDecorators` and
  `emitDecoratorMetadata` from [`tsconfig.json`](./tsconfig.json); without them Nest cannot inject
  by type.
