import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
import type { DatingRange } from '../../../shared/dating-range.js';
import { DatingRangePipe } from './dating-range.pipe.js';
import { StoryService } from './story.service.js';

@Controller('api/story')
export class StoryController {
  constructor(private readonly stories: StoryService) {}

  /**
   * GET /api/story/:age: a 1080×1920 PNG of the dating range for `age`, for a story.
   * On Vercel the CDN answers a valid age with the file the build drew (vercel.json) and only
   * an invalid one gets here; locally this draws the image.
   */
  @Get(':age')
  // Browsers ask again on each use, so a new deployment's image replaces the old one at once.
  @Header('Cache-Control', 'public, max-age=0, must-revalidate')
  async image(@Param('age', DatingRangePipe) range: DatingRange): Promise<StreamableFile> {
    return new StreamableFile(await this.stories.render(range), { type: 'image/png' });
  }
}
