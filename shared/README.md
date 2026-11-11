# Shared

The "half your age plus seven" rule, in [`dating-range.ts`](./dating-range.ts): Agedate's only
domain logic. The [web](../web/README.md) app shows the range and the [API](../api/README.md) draws
it; both import this file through the `@shared/*` alias, so the numbers cannot drift apart.

## 📐 The rule

|                  | Value                                                                     |
| :--------------- | :------------------------------------------------------------------------ |
| youngest partner | age ÷ 2 + 7; up to age 25 a half year is kept (17.5), above it rounded up |
| oldest partner   | (age − 7) × 2, capped at 120                                              |
| no range         | below 14, where the youngest would be older than the oldest               |
| accepted ages    | whole numbers from 1 to 120 (`isAge`)                                     |

## ⚙️ How it's wired

- **No `package.json` and no build.** It is compiled three times, by Angular's build, by Turbopack
  and by Vitest, each through its own alias. Keep it plain TypeScript with no imports, so it stays
  valid for all three.
- **`MIN_AGE` and `MAX_AGE` are the single source** for the limits. The web app's messages and the
  API's error text interpolate them, so code never writes 14 or 120 as a literal. Tests do, on
  purpose: an expected value is spelled out.
- **A rule change reaches the images only after a deployment**, because they are drawn at build
  time.

## 💻 Development

Nothing to run: change the file and the consumers pick it up. Their dev servers reload it.

## 🧪 Testing

[`dating-range.test.ts`](./dating-range.test.ts) runs in the API's Vitest (`npm --prefix api test`).
A rule change is a row in its `it.each` table.
