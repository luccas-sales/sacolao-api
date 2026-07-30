import { Module } from '@nestjs/common';
import { DailySalesController } from './daily-sales.controller';
import { DailySalesService } from './daily-sales.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [DailySalesController],
  providers: [DailySalesService, PrismaService],
})
export class DailySalesModule {}
