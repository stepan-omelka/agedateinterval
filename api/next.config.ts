import type { NextConfig } from 'next';
import path from 'node:path';

// The repo root, so the API can import the dating-range rule from ../shared.
const repoRoot = path.join(__dirname, '..');

/**
 * Sent with every response. Which scripts may run is limited by the hash-based policy that
 * Angular writes into index.html (`security.autoCsp` in web/angular.json); this header adds the
 * directives a <meta> policy cannot set, such as `frame-ancestors`.
 */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

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
      { source: '/:path*', headers: securityHeaders },
      {
        // Angular's bundles have a content hash in their names (main-P3NXDTTF.js),
        // so a new build never reuses a name and browsers may keep them for a year.
        // scripts/copy-web.mjs fails the build if Angular's file names stop matching.
        source: '/:file([\\w-]+-[A-Z0-9]{8}\\.(?:js|css))',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
