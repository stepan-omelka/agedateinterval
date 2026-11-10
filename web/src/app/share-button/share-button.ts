import { httpResource } from '@angular/common/http';
import { Component, inject, input, linkedSignal } from '@angular/core';
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

  protected async share(): Promise<void> {
    const image = this.image.value();
    if (!image) {
      return;
    }
    try {
      // Nothing may be awaited before this call: it opens the share sheet (see StoryShare).
      const outcome = await this.storyShare.share(image, `agedate-${this.age()}.png`);
      this.status.set(outcome === 'downloaded' ? 'Image downloaded!' : '');
    } catch (error) {
      console.error(error);
      this.status.set("Couldn't share the image. Try again.");
    }
  }
}
