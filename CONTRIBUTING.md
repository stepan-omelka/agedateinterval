# 🤝 Contributing

## 🧰 Prerequisites

- [Node.js](https://nodejs.org/en/download) 24 (the version is in [`.node-version`](./.node-version))
- npm 11, which ships with it

## 💻 Development

Start at [`ARCHITECTURE.md`](./ARCHITECTURE.md) when you do not know which project a change belongs
to. Every script runs from the repo root:

```sh
# install the root, api/ and web/ (the root postinstall does the last two)
npm install

# both dev servers: web on http://localhost:4400, api on http://localhost:3400
npm run dev

# production build (Angular copied into Next.js, as on Vercel), then serve it on :3400
npm run build
npm start

# all tests: shared/ and api/, then web/
npm test

# ESLint for api/ and web/
npm run lint

# Prettier for the whole repo (check only / fix)
npm run format:check
npm run format

# add a dependency to one project
npm install <package> --prefix web
```

A project's own scripts (`npm --prefix api run dev`, `npm --prefix web test`, ...) are in its
`package.json` and its README's _Development_ section.

### Code style

Formatting, import order and most type-safety rules are enforced by Prettier, ESLint and
TypeScript. The conventions a tool cannot enforce are in
[`docs/coding-standards.md`](./docs/coding-standards.md).

### Testing

Test layers, their commands and file naming are in
[`docs/testing-strategy.md`](./docs/testing-strategy.md).

### Comments and documentation

When a comment or a doc earns its place, where it goes and the shape a project README takes are in
[`docs/comments-and-docs-policy.md`](./docs/comments-and-docs-policy.md).

## 🔀 Git

### Commit messages

Commit messages must follow the [Conventional Commits](https://conventionalcommits.org/) format.

Scopes are the project folders, `web`, `api` and `shared`, which [Commitlint](https://commitlint.js.org/)
enforces ([`commitlint.config.ts`](./commitlint.config.ts)). Name several with a comma, or leave the
scope out for a change to the whole repo. Types follow _semantic versioning_ semantics: `feat`, `fix`
and `perf` are reserved for changes that affect people using the app.

> [!TIP]
> For an interactive prompt with the supported types and scopes, stage your changes and run
> `npm run commit` ([Commitizen](https://commitizen-tools.github.io/commitizen/)).

Write commit messages in the imperative, summarizing the _what_ and the _why_ (the _how_ is in the
diff). For example:

- `feat(web): show the range as you type`
- `fix(api): reject ages with leading zeros`
- `fix(shared,web): round the minimum up above 25`
- `test(web): cover a canceled share sheet`
- `docs(api): describe the image cache`
- `ci: run the build on pull requests`
- `build: update Angular to 22.3`

### Hooks

[Husky](https://typicode.github.io/husky) installs two Git hooks on `npm install`:

- **pre-commit** runs Prettier on the staged files ([lint-staged](https://github.com/lint-staged/lint-staged)),
- **commit-msg** runs Commitlint on the message.

### Branches

The branching follows [trunk-based development](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development).
`main` is always deployable, because **every push to `main` deploys to production**. A change that
needs a look before it goes live goes on a short-lived branch: Vercel builds a preview deployment of
every pushed branch, and the [CI workflow](./.github/workflows/ci.yml) checks every pull request.

Keep `main`'s history linear: merge a branch by rebasing it or squashing it, never with a merge
commit.
