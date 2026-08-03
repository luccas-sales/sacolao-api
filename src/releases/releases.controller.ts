import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import type { Response } from 'express';

@Controller('updates')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Get(['win32/:version', 'win32/:version/:file'])
  async getUpdate(
    @Param('version') version: string,
    @Param('file') file: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    return await this.releasesService.getUpdate(version, file, token, res);
  }
}
