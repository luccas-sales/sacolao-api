import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    this.logger.log('Listando todas as lojas cadastradas');

    return await this.prisma.stores.findMany({
      orderBy: {
        number: 'asc',
      },
    });
  }
}
