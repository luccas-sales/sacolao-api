import { Module } from '@nestjs/common';
import { SuppliersDescriptionsController } from './suppliers-descriptions.controller';
import { SuppliersDescriptionsService } from './suppliers-descriptions.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SuppliersDescriptionsController],
  providers: [SuppliersDescriptionsService, PrismaService],
})
export class SuppliersDescriptionsModule {}
