import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SuppliersDescriptionsService } from './suppliers-descriptions.service';
import {
  CreateSuppliersDescriptionsDTO,
  UpdateSuppliersDescriptionsDTO,
} from '../dtos/suppliersDescriptions';

@Controller('suppliers-descriptions')
export class SuppliersDescriptionsController {
  constructor(
    private suppliersDescriptionsService: SuppliersDescriptionsService,
  ) {}

  @Post()
  async createSuppliers(@Body() body: CreateSuppliersDescriptionsDTO) {
    return await this.suppliersDescriptionsService.createSuppliersDescriptions(
      body,
    );
  }

  @Get()
  async getSuppliers() {
    return await this.suppliersDescriptionsService.getSuppliersDescriptions();
  }

  @Put('/:id')
  async updateSuppliers(
    @Param('id') id: string,
    @Body() body: UpdateSuppliersDescriptionsDTO,
  ) {
    return await this.suppliersDescriptionsService.updateSuppliersDescriptions(
      id,
      body,
    );
  }

  @Delete('/:id')
  async deleteSuppliers(@Param('id') id: string) {
    return await this.suppliersDescriptionsService.deleteSuppliersDescriptions(
      id,
    );
  }
}
