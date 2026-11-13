import { join } from 'node:path';
import { createApp } from './create-app.js';

// The local server: `npm run dev` and `npm start`. On Vercel, api/index.ts is the entry.
const app = await createApp();
// The built site (`npm run build`), which on Vercel the CDN serves. Run from api/.
app.useStaticAssets(join(process.cwd(), 'public'));
await app.listen(process.env.PORT ?? 3400);
