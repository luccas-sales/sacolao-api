import { Controller, Get, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  async getStores() {
    return await this.storesService.findAll();
  }
}
