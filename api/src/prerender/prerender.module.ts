import { Module } from '@nestjs/common';
import { ImageModule } from '../image/image.module.js';
import { StoryModule } from '../story/story.module.js';
import { Prerenderer } from './prerenderer.js';

/** Only the build uses this module (src/prerender.ts); the HTTP application leaves it out. */
@Module({
  imports: [ImageModule, StoryModule],
  providers: [Prerenderer],
})
export class PrerenderModule {}
