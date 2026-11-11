import { ImageResponse } from 'next/og';
import { BRAND_GRADIENT, Heart, interFonts } from '@/lib/brand';

/** Drawn once at build time. */
export const dynamic = 'force-static';

/**
 * GET /og-image.png: the 1200×630 picture shown when a link to Agedate is shared in a chat or
 * on a social network. web/src/index.html points its `og:image` here.
 */
export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: BRAND_GRADIENT,
        fontFamily: 'Inter',
        color: 'white',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Heart size={120} color="white" />
        <div style={{ marginLeft: 28, fontSize: 132, fontWeight: 900, letterSpacing: -4 }}>
          Agedate
        </div>
      </div>
      <div style={{ marginTop: 24, fontSize: 52, fontWeight: 700 }}>What age is it OK to date?</div>
      <div
        style={{
          marginTop: 48,
          padding: '20px 44px',
          borderRadius: 999,
          background: 'white',
          fontSize: 36,
          fontWeight: 700,
          color: '#db2777',
        }}
      >
        Half your age plus seven
      </div>
    </div>,
    { width: 1200, height: 630, fonts: await interFonts },
  );
}
