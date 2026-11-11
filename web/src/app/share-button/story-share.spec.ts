import { TestBed } from '@angular/core/testing';
import type { MockInstance } from 'vitest';
import { StoryShare } from './story-share';

describe('StoryShare', () => {
  let storyShare: StoryShare;
  let click: MockInstance<() => void>;

  const image = new Blob(['png'], { type: 'image/png' });

  beforeEach(() => {
    storyShare = TestBed.inject(StoryShare);
    click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    // jsdom has no object URLs.
    URL.createObjectURL = vi.fn(() => 'blob:story');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    const webShare: Partial<Navigator> = navigator;
    delete webShare.share;
    delete webShare.canShare;
  });

  /** jsdom has no Web Share API, so give its navigator one. */
  function stubWebShare(share: () => Promise<void>) {
    const stub = { canShare: vi.fn(() => true), share: vi.fn(share) };
    for (const [key, value] of Object.entries(stub)) {
      Object.defineProperty(navigator, key, { value, configurable: true });
    }
    return stub;
  }

  it('opens the share sheet with the image as a file', async () => {
    const webShare = stubWebShare(() => Promise.resolve());

    expect(await storyShare.share(image, 'agedate-25.png')).toBe('shared');

    const [{ files }] = webShare.share.mock.calls[0] as unknown as [ShareData];
    expect(files?.[0]).toMatchObject({ name: 'agedate-25.png', type: 'image/png' });
    expect(click).not.toHaveBeenCalled();
  });

  it('does nothing more when the share sheet is closed', async () => {
    stubWebShare(() => Promise.reject(new DOMException('Cancelled', 'AbortError')));

    expect(await storyShare.share(image, 'agedate-25.png')).toBe('canceled');
    expect(click).not.toHaveBeenCalled();
  });

  it('downloads the image when the browser refuses to share', async () => {
    stubWebShare(() => Promise.reject(new DOMException('No gesture', 'NotAllowedError')));

    expect(await storyShare.share(image, 'agedate-25.png')).toBe('downloaded');
    expect(click).toHaveBeenCalledOnce();
  });

  it('downloads the image where there is no share sheet', async () => {
    vi.useFakeTimers();

    expect(await storyShare.share(image, 'agedate-25.png')).toBe('downloaded');
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe('agedate-25.png');
    expect(link.href).toBe('blob:story');

    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:story');
    vi.useRealTimers();
  });

  it('passes on unexpected errors', async () => {
    stubWebShare(() => Promise.reject(new TypeError('broken')));

    await expect(storyShare.share(image, 'agedate-25.png')).rejects.toThrow('broken');
  });
});
