import { NestFactory } from '@nestjs/core';
import { resolve } from 'node:path';
import { PrerenderModule } from './prerender/prerender.module.js';
import { Prerenderer } from './prerender/prerenderer.js';

// `node dist/api/src/prerender.js <web root>`, run by `npm run build:site`: draws the images at
// build time, through the same providers as the HTTP application but without a server.
const [, , webRoot] = process.argv;
if (webRoot === undefined) {
  throw new Error('Usage: node prerender.js <web root>');
}

const app = await NestFactory.createApplicationContext(PrerenderModule, {
  logger: ['error', 'warn'],
});
const paths = await app.get(Prerenderer).writeImages(resolve(webRoot));
await app.close();
console.log(`Drew ${paths.length} images into ${resolve(webRoot)}`);
