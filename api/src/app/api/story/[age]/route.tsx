import { ImageResponse } from 'next/og';
import { MAX_AGE, MIN_AGE, datingRange } from '@shared/dating-range';
import { STORY_SIZE, StoryImage, storyFonts } from '@/lib/story-image';

/** Only canonical numbers ("25", not "025" or "25.0"), so each age has exactly one URL to cache. */
const AGE_PATTERN = /^[1-9]\d{0,2}$/;

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * GET /api/story/:age: a 1080×1920 PNG of the dating range for `age`, for sharing on a
 * story. The image depends only on the age and the host, so the CDN keeps it for a year
 * (a new deployment starts with an empty cache) and browsers for a day.
 */
export async function GET(request: Request, { params }: RouteContext<'/api/story/[age]'>) {
  const { age } = await params;
  const range = AGE_PATTERN.test(age) ? datingRange(Number(age)) : undefined;
  if (!range) {
    return badRequest(`The age must be a whole number from ${MIN_AGE} to ${MAX_AGE}.`);
  }

  const { hostname } = new URL(request.url);
  return new ImageResponse(
    <StoryImage range={range} host={LOCAL_HOSTS.has(hostname) ? undefined : hostname} />,
    {
      ...STORY_SIZE,
      fonts: await storyFonts,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000' },
    },
  );
}

/** A 400 response in the Problem Details format (RFC 9457). */
function badRequest(detail: string) {
  return Response.json(
    { type: 'about:blank', title: 'Bad Request', status: 400, detail },
    { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
  );
}
