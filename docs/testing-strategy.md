# 🧪 Testing strategy

## 📘 Principles

- **Test coverage over code coverage.** Ask which scenario is untested, not which line is unvisited.
- **Black-box over white-box.** Test through a module's public interface (a function's arguments, a
  route's request, a component's DOM), so a refactor that keeps the contract keeps the tests green.
- **A test reads as documentation.** The name states the behavior; the body shows how the unit is
  meant to be used. Start with the expected usage, end with edge cases.
- **DAMP over DRY.** Repetition inside a test is cheaper than indirection. No conditions or loops in
  a test body (`it.each` is fine).
- **Flaky means failing.** Fix it or delete it.
- **Dependency injection over module mocks.** Provide a stub through Angular's injector (as the
  `ShareButton` test does with `StoryShare`) rather than mocking a module.
- **DOM tests assert what the user sees**, through labels, roles and text, so they also check the
  markup is accessible.

## ▲ Layers

There are two, both on [Vitest](https://vitest.dev):

|                 | Unit                                          | Component                                           |
| :-------------- | :-------------------------------------------- | :-------------------------------------------------- |
| **Environment** | Node.js                                       | jsdom, through Angular's `@angular/build:unit-test` |
| **Scope**       | the rule in `shared/`, the API route handlers | Angular components and services in `web/`           |
| **File naming** | `*.test.ts` beside the source                 | `*.spec.ts` beside the source                       |
| **Command**     | `npm --prefix api test` (runs `shared/` too)  | `npm --prefix web test`                             |

`npm test` at the root runs both. There is no end-to-end layer: the only contract between `web`
and `api` is the image URL `/api/story/:age`, which the route tests and the `ShareButton` tests pin
down from each side.

## 🧭 Which layer

| A change to…                        | is tested by…                                                       |
| :---------------------------------- | :------------------------------------------------------------------ |
| the rule (`shared/dating-range.ts`) | a row in the `it.each` table of `shared/dating-range.test.ts`       |
| what the API accepts or returns     | `api/src/app/api/story/[age]/route.test.ts`                         |
| what the image looks like           | a look at the PNG (`npm run dev`, open `/api/story/25`); not tested |
| what the page shows for an input    | `web/src/app/app.spec.ts`                                           |
| sharing and its fallbacks           | `web/src/app/share-button/*.spec.ts`                                |

The project READMEs list each layer's footguns: [web](../web/README.md#-testing),
[api](../api/README.md#-testing).
