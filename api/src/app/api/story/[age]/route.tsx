import { ImageResponse } from 'next/og';
import { MAX_AGE, MIN_AGE, datingRange } from '@shared/dating-range';
import { interFonts } from '@/lib/brand';
import { STORY_SIZE, StoryImage } from '@/lib/story-image';

/**
 * Only canonical numbers ("25", not "025" or "25.0"). Any other spelling of a valid age would
 * be drawn again at request time instead of being served from the build.
 */
const AGE_PATTERN = /^[1-9]\d{0,2}$/;

/**
 * Every age that has a range, so the build draws all the images once and the CDN serves them
 * as static files: no function runs and no query string can force a new render. Anything else
 * still reaches GET at request time and gets a 400, which is then cached like the images.
 */
export function generateStaticParams(): { age: string }[] {
  return Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => ({ age: String(MIN_AGE + i) }));
}

/** GET /api/story/:age: a 1080×1920 PNG of the dating range for `age`, for a story. */
export async function GET(_request: Request, { params }: RouteContext<'/api/story/[age]'>) {
  const { age } = await params;
  const range = AGE_PATTERN.test(age) ? datingRange(Number(age)) : undefined;
  if (!range) {
    return badRequest(`The age must be a whole number from ${MIN_AGE} to ${MAX_AGE}.`);
  }

  // Not the request's host: reading the request would stop the build from drawing the image.
  // Vercel sets this on every deployment (previews too); locally the footer is left out.
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || undefined;
  return new ImageResponse(<StoryImage range={range} host={host} />, {
    ...STORY_SIZE,
    fonts: await interFonts,
    // Browsers ask again on each use, so a new deployment's image replaces the old one at once.
    headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' },
  });
}

/** A 400 response in the Problem Details format (RFC 9457). */
function badRequest(detail: string) {
  return Response.json(
    { type: 'about:blank', title: 'Bad Request', status: 400, detail },
    { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
  );
}
