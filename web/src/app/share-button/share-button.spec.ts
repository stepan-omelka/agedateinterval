import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareButton } from './share-button';
import { type ShareOutcome, StoryShare } from './story-share';

describe('ShareButton', () => {
  let fixture: ComponentFixture<ShareButton>;
  let http: HttpTestingController;
  let share: ReturnType<typeof vi.fn<StoryShare['share']>>;

  const image = new Blob(['png'], { type: 'image/png' });

  beforeEach(async () => {
    share = vi.fn<StoryShare['share']>();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StoryShare, useValue: { share } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ShareButton);
    fixture.componentRef.setInput('age', 25);
    // Not whenStable(): the image request is a pending task until the test flushes it.
    TestBed.tick();
  });

  afterEach(() => http.verify());

  const button = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  const status = () => fixture.nativeElement.querySelector('[role=status]').textContent.trim();

  async function loadImage(url = '/api/story/25'): Promise<void> {
    TestBed.tick();
    http.expectOne(url).flush(image);
    await fixture.whenStable();
  }

  async function clickShare(outcome: Promise<ShareOutcome>): Promise<void> {
    share.mockReturnValue(outcome);
    button().click();
    await outcome.catch(() => undefined);
    await fixture.whenStable();
  }

  it('preloads the image and waits for it before sharing', async () => {
    expect(button().disabled).toBe(true);
    expect(button().textContent).toContain('Painting pixels');

    await loadImage();

    expect(button().disabled).toBe(false);
    expect(button().textContent).toContain('Share on your story');
  });

  it('shares the preloaded image', async () => {
    await loadImage();
    await clickShare(Promise.resolve('shared'));

    expect(share).toHaveBeenCalledWith(image, 'agedate-25.png');
    expect(status()).toBe('');
  });

  it('says when the image was downloaded instead, until the age changes', async () => {
    await loadImage();
    await clickShare(Promise.resolve('downloaded'));
    expect(status()).toBe('Image downloaded!');

    fixture.componentRef.setInput('age', 30);
    await loadImage('/api/story/30');

    expect(status()).toBe('');
  });

  it('reports a failed share', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await loadImage();
    await clickShare(Promise.reject(new Error('boom')));

    expect(status()).toBe("Couldn't share the image. Try again.");
  });

  it('offers a retry when the image fails to load', async () => {
    http.expectOne('/api/story/25').flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(button().textContent).toContain('Try again');

    button().click();
    await loadImage();

    expect(button().textContent).toContain('Share on your story');
  });
});
