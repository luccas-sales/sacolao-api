import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { PrismaService } from 'src/prisma.service';
import { StoresController } from './stores.controller';

@Module({
  controllers: [StoresController],
  providers: [StoresService, PrismaService],
})
export class StoresModule {}
