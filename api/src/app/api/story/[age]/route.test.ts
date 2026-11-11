import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, generateStaticParams } from './route';

function getStory(age: string) {
  return GET(new Request(`http://localhost/api/story/${age}`), {
    params: Promise.resolve({ age }),
  });
}

/** A PNG's IHDR chunk stores the width and height at bytes 16 and 20. */
async function pngSize(response: Response) {
  const png = new DataView(await response.arrayBuffer());
  return [png.getUint32(16), png.getUint32(20)];
}

describe('GET /api/story/:age', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('renders a 1080×1920 PNG that browsers check again on each use', async () => {
    const response = await getStory('25');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(response.headers.get('cache-control')).toBe('public, max-age=0, must-revalidate');
    expect(await pngSize(response)).toEqual([1080, 1920]);
  });

  it.each(['14', '120'])('renders the edge age %s', async age => {
    const response = await getStory(age);

    expect(response.status).toBe(200);
    expect(await pngSize(response)).toEqual([1080, 1920]);
  });

  it('puts the production host name under the card on Vercel', async () => {
    const withoutHost = Buffer.from(await (await getStory('25')).arrayBuffer());
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'agedate.vercel.app');

    const response = await getStory('25');

    expect(response.status).toBe(200);
    expect(Buffer.from(await response.arrayBuffer()).equals(withoutHost)).toBe(false);
  });

  it.each(['13', '121', '0', '025', '25.5', 'abc'])(
    'rejects %s with Problem Details',
    async age => {
      const response = await getStory(age);

      expect(response.status).toBe(400);
      expect(response.headers.get('content-type')).toBe('application/problem+json');
      expect(await response.json()).toEqual({
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: 'The age must be a whole number from 14 to 120.',
      });
    },
  );
});

describe('generateStaticParams', () => {
  it('lists every age that has a range, so the build draws them all', () => {
    const ages = generateStaticParams().map(({ age }) => age);

    expect(ages).toHaveLength(107);
    expect(ages.at(0)).toBe('14');
    expect(ages.at(-1)).toBe('120');
  });
});
