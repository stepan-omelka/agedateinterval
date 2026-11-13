import type { DatingRange } from '../../../shared/dating-range.js';
import { BRAND_GRADIENT, BRAND_TEXT } from '../image/brand.js';
import { type ImageNode, h } from '../image/image-node.js';

/** Instagram and Facebook stories are 9:16. */
export const STORY_SIZE = { width: 1080, height: 1920 } as const;

const colors = {
  accent: '#db2777',
  ink: '#1e293b',
  muted: '#64748b',
  faint: '#94a3b8',
  line: '#e2e8f0',
};

type StoryImageProps = {
  range: DatingRange;
  /** Shown under the card so people can find the app; left out when empty or `undefined`. */
  host: string | undefined;
};

/**
 * The story image. Satori supports a subset of CSS: every element with more than one child
 * needs `display: flex`.
 */
export function storyImage({ range, host }: StoryImageProps): ImageNode {
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
      },
    },
    h(
      'div',
      { style: { fontSize: 80, fontWeight: 900, letterSpacing: -2, color: 'white' } },
      'Agedate',
    ),
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Satori follows CSS: without this the padding would be added to the width.
          boxSizing: 'border-box',
          width: 920,
          marginTop: 64,
          padding: '96px 48px',
          borderRadius: 72,
          background: 'white',
          boxShadow: '0 24px 64px rgba(15, 23, 42, 0.25)',
        },
      },
      h(
        'div',
        { style: { fontSize: 36, fontWeight: 700, letterSpacing: 6, color: colors.accent } },
        'MY DATING RANGE',
      ),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', marginTop: 72 } },
        bound('MIN', range.min),
        h('div', {
          style: {
            width: 6,
            height: 200,
            margin: '0 56px',
            borderRadius: 3,
            background: colors.line,
          },
        }),
        bound('MAX', range.max),
      ),
      h(
        'div',
        { style: { marginTop: 72, fontSize: 34, fontWeight: 500, color: colors.muted } },
        'Half your age plus seven',
      ),
    ),
    host
      ? h(
          'div',
          {
            style: {
              marginTop: 72,
              fontSize: 36,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.85)',
            },
          },
          host,
        )
      : undefined,
  );
}

function bound(label: string, value: number): ImageNode {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
    h(
      'div',
      {
        style: {
          fontSize: 180,
          fontWeight: 900,
          letterSpacing: -6,
          lineHeight: 1,
          color: colors.ink,
        },
      },
      String(value),
    ),
    h(
      'div',
      {
        style: {
          marginTop: 28,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 4,
          color: colors.faint,
        },
      },
      label,
    ),
  );
}
