import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(@Query('month') month: string) {
    return await this.productsService.getProductsFromMonth(month);
  }

  @Put('bulk-update')
  async bulkUpdateProducts(@Body('products') products: any[]) {
    return await this.productsService.bulkUpdate(products);
  }

  @Post('import')
  async importExcel(@Body() payload: any) {
    return await this.productsService.importFromExcel(payload);
  }
}