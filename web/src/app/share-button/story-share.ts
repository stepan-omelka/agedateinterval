import { DOCUMENT, Service, inject } from '@angular/core';

export type ShareOutcome = 'shared' | 'cancelled' | 'downloaded';

/**
 * Hands the story image to the system share sheet where the browser has one (phones,
 * Safari), and downloads it everywhere else.
 */
@Service()
export class StoryShare {
  private readonly document = inject(DOCUMENT);

  /**
   * Call this straight from a click handler, with nothing awaited first: browsers only
   * open the share sheet during a user gesture, and iOS Safari is strict about it.
   */
  async share(image: Blob, fileName: string): Promise<ShareOutcome> {
    const file = new File([image], fileName, { type: image.type || 'image/png' });
    const navigator = this.document.defaultView?.navigator;

    if (navigator?.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Agedate', text: 'Check my dating range!' });
        return 'shared';
      } catch (error) {
        if (isDomError(error, 'AbortError')) {
          return 'cancelled';
        }
        // NotAllowedError: the browser refused to open the sheet, so download instead.
        if (!isDomError(error, 'NotAllowedError')) {
          throw error;
        }
      }
    }

    this.download(file);
    return 'downloaded';
  }

  private download(file: File): void {
    const url = URL.createObjectURL(file);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    // Safari can fail the download if the URL is revoked right away.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function isDomError(error: unknown, name: string): boolean {
  return error instanceof DOMException && error.name === name;
}
