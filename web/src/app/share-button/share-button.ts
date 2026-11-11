import { httpResource } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { StoryShare } from './story-share';

@Component({
  selector: 'app-share-button',
  templateUrl: './share-button.html',
  styleUrl: './share-button.scss',
})
export class ShareButton {
  readonly age = input.required<number>();

  private readonly storyShare = inject(StoryShare);

  /**
   * The story image, rendered by the API. It is loaded as soon as the range is on screen,
   * not on click, because the share sheet only opens if nothing is awaited before it.
   */
  protected readonly image = httpResource.blob(() => `/api/story/${this.age()}`);

  /** Feedback after a click, cleared whenever the age changes. */
  protected readonly status = linkedSignal({ source: this.age, computation: () => '' });

  /** While the share sheet is open, a second tap must not try to open another one. */
  private readonly sharing = signal(false);

  /** What the one button does. It stays the same element, so it keeps keyboard focus. */
  protected readonly state = computed(() =>
    this.image.isLoading() ? 'loading' : this.image.error() ? 'failed' : 'ready',
  );

  protected readonly busy = computed(() => this.state() === 'loading' || this.sharing());

  protected onClick(): void {
    if (this.busy()) {
      return;
    }
    if (this.state() === 'failed') {
      this.image.reload();
      return;
    }
    const image = this.image.value();
    if (image) {
      void this.share(image);
    }
  }

  private async share(image: Blob): Promise<void> {
    this.sharing.set(true);
    try {
      // Nothing may be awaited before this call: it opens the share sheet (see StoryShare).
      const outcome = await this.storyShare.share(image, `agedate-${this.age()}.png`);
      this.status.set(outcome === 'downloaded' ? 'Image downloaded!' : '');
    } catch (error) {
      console.error(error);
      this.status.set("Couldn't share the image. Try again.");
    } finally {
      this.sharing.set(false);
    }
  }
}
