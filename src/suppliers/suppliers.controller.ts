import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { CreateSuppliersDTO, UpdateSuppliersDTO } from '../dtos/suppliers';
import { SuppliersService } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  async createSuppliers(@Body() body: CreateSuppliersDTO) {
    return await this.suppliersService.createSuppliers(body);
  }

  @Get()
  async getSuppliers() {
    return await this.suppliersService.getSuppliers();
  }

  @Put('/:id')
  async updateSuppliers(
    @Param('id') id: string,
    @Body() body: UpdateSuppliersDTO,
  ) {
    return await this.suppliersService.updateSuppliers(id, body);
  }

  @Delete('/:id')
  async deleteSuppliers(@Param('id') id: string) {
    return await this.suppliersService.deleteSuppliers(id);
  }
}
