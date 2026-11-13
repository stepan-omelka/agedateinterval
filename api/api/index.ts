import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../src/create-app.js';

type Handler = (request: IncomingMessage, response: ServerResponse) => void;

/**
 * The Vercel Function: Vercel turns a file in `<Root Directory>/api/` into one, and vercel.json
 * sends it every `/api/*` request that no file in public/ answers. Nest starts once per function
 * instance; `init()` instead of `listen()`, because Vercel owns the HTTP server. Without the
 * startup lines, which every cold start would write to the runtime logs.
 */
const handler = createApp(['error', 'warn']).then(async app => {
  await app.init();
  return app.getHttpAdapter().getInstance() as Handler;
});

export default async function (request: IncomingMessage, response: ServerResponse): Promise<void> {
  (await handler)(request, response);
}
