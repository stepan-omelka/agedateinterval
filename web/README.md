# Web

The Agedate frontend: an [Angular](https://angular.dev) single-page app with one screen. It works out
the range in the browser with the [shared rule](../shared/README.md) and gets the story image from
the [API](../api/README.md). In production its build is published from the API's `public/` folder;
there is no server of its own.

## ⚙️ How it's wired

- **Zoneless and signal-based**, with no router (there is one screen) and no NgModules.
  `OnPush` is Angular 22's default.
- **One `Result` drives the page.** [`App`](./src/app/app.ts) derives a single discriminated union
  from the form (`empty`, `invalid`, `too-young`, `range`) with `computed()`, and the template
  switches on its `kind`. A new state is a new member of the union, not a new boolean.
- **The age field is a Signal Forms field** (`form()` + `[formField]`). Its validators carry the
  error messages. The model is `number | null` because Signal Forms maps an empty number input to
  `null`. `debounce()` holds each keystroke back 300 ms (or until the field loses focus), so a
  half-typed "2" of "25" never shows as too young.
- **`[formField]` sets no ARIA attributes.** The template binds `aria-invalid` and
  `aria-describedby` from `result()`; keep them in step with the error message.
- **One live region holds every result**, the error message included. It is always on the page,
  because screen readers announce changes reliably only in a live region that existed before.
- **Components**: [`RangeCard`](./src/app/range-card/range-card.ts) is presentational (one input);
  [`ShareButton`](./src/app/share-button/share-button.ts) loads and shares the image through the
  [`StoryShare`](./src/app/share-button/story-share.ts) service.
- **`@shared/*`** resolves to `../shared` through `paths` in [`tsconfig.json`](./tsconfig.json), and
  Angular's build compiles it like any other source file.

## 📤 Sharing

- **Never await anything before `navigator.share()`.** Browsers open the share sheet only during the
  click's user activation, and iOS Safari loses it after a network round trip. That is why
  `ShareButton` preloads the image with `httpResource.blob()` as soon as a range is on screen, keeps
  the button disabled until it has loaded, and calls `StoryShare.share()` first thing in the click
  handler.
- **One button for every state** (loading, retry, share), disabled with `aria-disabled` rather than
  `disabled`: a `disabled` button drops keyboard focus to the page. A tap while the sheet is open is
  ignored, because a second `navigator.share()` call rejects.
- **Closing the share sheet is not an error** (`AbortError` → `'canceled'`). A `NotAllowedError`,
  and a browser without a share sheet, fall back to downloading the PNG.

## 🎨 Styling

- **SCSS, one file per component.** The colors are CSS custom properties in
  [`src/styles.scss`](./src/styles.scss); components use them for every hue (`color-mix()` for a
  transparent one). Plain white and black shadows are the only literals.
- **Contrast**: small text uses the 600+ shades, because the cards are tinted and the 500s fall just
  short of 4.5:1 there. White text sits only on the 600 gradient (the share button). The page
  gradient is too light for text.
- **Security**: the production build writes a hash-based Content Security Policy into `index.html`
  (`security.autoCsp` in `angular.json`), so an inline `<script>` added to `index.html` gets a hash
  automatically, and a script added any other way is blocked.
- **Link previews**: `src/index.html` has the Open Graph tags, with absolute URLs to the production
  site. The preview image and the home-screen icon are drawn by the [API](../api/README.md).
- `.fade-in` in `styles.scss` is the class for `animate.enter`, and `prefers-reduced-motion` switches
  every animation off.
- `angular.json` budgets component styles at 4 kB (warning) and 8 kB (error).

## 💻 Development

```sh
npm run dev                     # from the root: this app on :4400 and the API on :3400
npm --prefix web start          # this app alone; without the API the share button offers a retry
npm --prefix web run build      # production build in dist/web/browser/
npm --prefix web run lint       # angular-eslint, template accessibility rules included
npx --prefix web ng generate component <name>   # from web/; creates an .scss file
```

The dev server proxies `/api/*` to `localhost:3400` ([`proxy.conf.json`](./proxy.conf.json)).
[`CONTRIBUTING.md`](../CONTRIBUTING.md) has the repo-wide scripts.

## 🧪 Testing

Component tests on Vitest and jsdom, through `@angular/build:unit-test`, as `*.spec.ts` beside the
source; the [testing strategy](../docs/testing-strategy.md) has the principles.

```sh
npm --prefix web test -- --watch=false
```

- **Don't `await fixture.whenStable()` while an image request is unflushed.** A resource counts as a
  pending task, so `whenStable()` waits for it and the hook times out after 10 s. Call
  `TestBed.tick()`, flush the request through `HttpTestingController`, then `whenStable()`.
- **A test that shows a range mounts `ShareButton`**, which requests the image, so it needs
  `provideHttpClient()` and `provideHttpClientTesting()`.
- **jsdom has no Web Share API and no `URL.createObjectURL`.** Define them on `navigator` and `URL`
  in the test. `vi.stubGlobal('navigator', …)` does not work: `StoryShare` reads
  `document.defaultView.navigator`, which is jsdom's own object.
