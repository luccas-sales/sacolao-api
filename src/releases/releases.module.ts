import { Module } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { UpdatesController } from './releases.controller';

@Module({
  controllers: [UpdatesController], 
  providers: [ReleasesService],
})
export class ReleasesModule {}
