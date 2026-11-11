import { ImageResponse } from 'next/og';
import { BRAND_GRADIENT, Heart } from '@/lib/brand';

/** Drawn once at build time. */
export const dynamic = 'force-static';

/**
 * GET /apple-touch-icon.png: the 180×180 icon iOS uses for a bookmark on the home screen, and
 * that Safari and some chat apps request at this fixed path. iOS rounds the corners itself.
 */
export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: BRAND_GRADIENT,
      }}
    >
      <Heart size={112} color="white" />
    </div>,
    { width: 180, height: 180 },
  );
}
