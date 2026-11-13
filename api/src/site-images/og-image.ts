import { BRAND_GRADIENT, BRAND_TEXT, heart } from '../image/brand.js';
import { type ImageNode, h } from '../image/image-node.js';

/** The size link previews expect; web/src/index.html states it in `og:image:width` and `height`. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/**
 * /og-image.png: the picture shown when a link to Agedate is shared in a chat or on a social
 * network. web/src/index.html points its `og:image` here.
 */
export function ogImage(): ImageNode {
  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: BRAND_GRADIENT,
        ...BRAND_TEXT,
        color: 'white',
      },
    },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center' } },
      heart(120, 'white'),
      h(
        'div',
        { style: { marginLeft: 28, fontSize: 132, fontWeight: 900, letterSpacing: -4 } },
        'Agedate',
      ),
    ),
    h(
      'div',
      { style: { marginTop: 24, fontSize: 52, fontWeight: 700 } },
      'What age is it OK to date?',
    ),
    h(
      'div',
      {
        style: {
          marginTop: 48,
          padding: '20px 44px',
          borderRadius: 999,
          background: 'white',
          fontSize: 36,
          fontWeight: 700,
          color: '#db2777',
        },
      },
      'Half your age plus seven',
    ),
  );
}
