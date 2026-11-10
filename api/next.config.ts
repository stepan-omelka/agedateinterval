import type { NextConfig } from 'next';
import path from 'node:path';

// The repo root, so the API can import the dating-range rule from ../shared.
const repoRoot = path.join(__dirname, '..');

const nextConfig: NextConfig = {
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
  async rewrites() {
    // In production the Angular build is copied into public/ (`npm run build:site`).
    // The app has a single page, so only "/" needs to map to its index.html.
    return [{ source: '/', destination: '/index.html' }];
  },
  async headers() {
    return [
      {
        // Angular's bundles have a content hash in their names (main-P3NXDTTF.js),
        // so a new build never reuses a name and browsers may keep them for a year.
        source: '/:file([\\w-]+-[A-Z0-9]{8}\\.(?:js|css))',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
