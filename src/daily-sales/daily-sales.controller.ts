import { Body, Controller, Get, Post, Param, Put, Query } from '@nestjs/common';
import { DailySalesService } from './daily-sales.service';
import {
  CreateDailySalesListDTO,
  UpdateDailySaleDTO,
} from '../dtos/daily-sales';

@Controller('daily-sales')
export class DailySalesController {
  constructor(private dailySalesService: DailySalesService) {}

  @Post('import')
  async importSales(@Body() body: CreateDailySalesListDTO) {
    return await this.dailySalesService.createDailySales(body);
  }

  @Get()
  async getSales(
    @Query('storeId') storeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.dailySalesService.getSales(storeId, startDate, endDate);
  }

  @Put(':id')
  async updateSale(@Param('id') id: string, @Body() body: UpdateDailySaleDTO) {
    return await this.dailySalesService.updateSale(id, body);
  }
}
