import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Also runs the tests of the rule in ../shared, which has no test runner of its own.
    dir: repoRoot,
    include: ['api/src/**/*.test.{ts,tsx}', 'shared/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
  },
});
