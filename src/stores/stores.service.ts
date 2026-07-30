import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.stores.findMany({
      orderBy: {
        number: 'asc',
      },
    });
  }
}
