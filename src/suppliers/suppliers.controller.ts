import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateSuppliersListDTO, UpdateSuppliersDTO } from '../dtos/suppliers';
import { SuppliersService } from './suppliers.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliersService: SuppliersService) {}

  @Post()
  async createSuppliers(@Body() body: CreateSuppliersListDTO) {
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
