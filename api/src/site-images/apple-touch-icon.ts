import { BRAND_GRADIENT, heart } from '../image/brand.js';
import { type ImageNode, h } from '../image/image-node.js';

/** The size iOS asks for. */
export const APPLE_TOUCH_ICON_SIZE = { width: 180, height: 180 } as const;

/**
 * /apple-touch-icon.png: the icon iOS uses for a bookmark on the home screen, and that Safari
 * and some chat apps request at this fixed path. iOS rounds the corners itself.
 */
export function appleTouchIcon(): ImageNode {
  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: BRAND_GRADIENT,
      },
    },
    heart(112, 'white'),
  );
}
