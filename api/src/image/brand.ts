import { type ImageNode, h } from './image-node.js';

/** The pink-to-violet background of every image, as in web/public/favicon.svg. */
export const BRAND_GRADIENT = 'linear-gradient(160deg, #ec4899 0%, #8b5cf6 100%)';

/**
 * The text style of every image, for its root element. Kerning stays off: with it Satori sets
 * each label a few pixels narrower, and the pictures would no longer match the ones already shared.
 */
export const BRAND_TEXT = { fontFamily: 'Inter', fontKerning: 'none' } as const;

/** The heart from the web app's age field and favicon. */
export function heart(size: number, color: string): ImageNode {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 20 20' },
    h('path', {
      fill: color,
      fillRule: 'evenodd',
      clipRule: 'evenodd',
      d: 'M3.172 5.172a4 4 0 0 1 5.656 0L10 6.343l1.172-1.171a4 4 0 1 1 5.656 5.656L10 17.657l-6.828-6.829a4 4 0 0 1 0-5.656z',
    }),
  );
}
