// Copies the Angular build into public/, so one Next.js app serves both the
// frontend and the API from the same origin. Run by `npm run build:site`.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const from = fileURLToPath(new URL('../../web/dist/web/browser/', import.meta.url));
const to = fileURLToPath(new URL('../public/', import.meta.url));

if (!existsSync(from)) {
  console.error(`Angular build not found at ${from}. Run "npm run build" in web/ first.`);
  process.exit(1);
}

rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
console.log(`Copied the Angular build into ${to}`);
