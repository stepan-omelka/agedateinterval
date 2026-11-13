import { Module } from '@nestjs/common';
import { ImageModule } from '../image/image.module.js';
import { StoryController } from './story.controller.js';
import { StoryService } from './story.service.js';

@Module({
  imports: [ImageModule],
  controllers: [StoryController],
  providers: [StoryService],
  exports: [StoryService],
})
export class StoryModule {}
