import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    // Also runs the tests of the rule in ../shared, which has no test runner of its own.
    dir: fileURLToPath(new URL('..', import.meta.url)),
    include: ['api/src/**/*.test.ts', 'shared/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
  },
});
