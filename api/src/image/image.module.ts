import { Module } from '@nestjs/common';
import { ImageRenderer } from './image-renderer.js';

@Module({
  providers: [ImageRenderer],
  exports: [ImageRenderer],
})
export class ImageModule {}
