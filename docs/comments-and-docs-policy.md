# 📝 Comments and docs policy

When a code comment or a doc earns its place, and where it goes. _Docs_ are the Markdown files
contributors read: READMEs, `AGENTS.md`, `CONTRIBUTING.md` and everything under `docs/`. Applies to
human and AI contributions alike.

## The default

Code should explain itself through naming, types and structure. A comment or a doc carries only
what the code _cannot_ express.

## The test

Before adding a comment or a doc section, and when deciding whether an existing one stays, ask what
happens without it: **would a competent reader make a wrong change?** If not, leave it out. If so,
prefer a test that catches the wrong change; otherwise put it where that reader will meet it.

- A reader who would look it up anyway does not need it; one who would not think to look does.
- **When borderline, leave it out.**

## Where it goes

| What                                                    | Where it goes                |
| :------------------------------------------------------ | :--------------------------- |
| a constraint on one piece of code                       | a comment at that code       |
| what every change to a project needs                    | that project's `README.md`   |
| what every change in the repo needs                     | `CONTRIBUTING.md` or `docs/` |
| a conclusion scattered across several files             | the nearest `AGENTS.md`      |
| behaviour a test can check                              | the test                     |
| anything with a home of its own (a file, a tool's docs) | that home; link it           |
| what the code does, or a narration of its steps         | nowhere; the code says it    |
| history ("ported from …", "was X, now Y")               | the commit message           |
| status ("not yet", "upcoming"), plans                   | a GitHub issue               |

## 💬 Comments

| A comment for…                          | must include…                                 |
| :-------------------------------------- | :-------------------------------------------- |
| a workaround for a browser or tool bug  | a link to the upstream issue, if there is one |
| version- or platform-specific behaviour | the version or platform it depends on         |
| a non-obvious failure mode              | what triggers it                              |
| an invisible constraint                 | the source the value must stay in sync with   |
| code that looks wrong but is right      | what breaks if it is "fixed"                  |

Keep a comment, JSDoc included, to about two lines. State the constraint, not the story.

## 📚 Docs

Docs are onboarding guideposts: architecture, conventions, footguns. Prefer a table or a diagram to
prose.

### Project READMEs

A project's `README.md` is read before every change to the project, so it holds only what every
such change needs: what the project is, how it is wired, and the rules and footguns every
contributor must know.

- **No section for one component or one feature.** It matters only to whoever changes it, so its
  constraints go in comments and its behaviour in tests. A footgun that bites every change to the
  project (such as the share sheet's user activation in `web`) is the exception.
- It **ends with `💻 Development` and `🧪 Testing`**, in that order. They hold only what is specific
  to the project and link [`CONTRIBUTING.md`](../CONTRIBUTING.md) and
  [`testing-strategy.md`](./testing-strategy.md) rather than repeat them.
- A reference to another project is a **relative link to its `README.md`**.
- Its `AGENTS.md` is a **thin pointer**: a few bullets linking that `README.md` and the shared docs
  the project needs. Rules live in the `README.md`, never in both. Its `CLAUDE.md` stays the bare
  `@AGENTS.md` include.
