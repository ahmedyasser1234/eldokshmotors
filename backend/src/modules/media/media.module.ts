import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  controllers: [MediaController],
  providers: [MediaService, CloudinaryProvider],
  exports: [MediaService, CloudinaryProvider],
})
export class MediaModule {}
