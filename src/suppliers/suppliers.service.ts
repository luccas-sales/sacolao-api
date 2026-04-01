import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSuppliersListDTO, UpdateSuppliersDTO } from 'src/dtos/suppliers';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prismaService: PrismaService) {}

  async createSuppliers(payload: CreateSuppliersListDTO) {
    return await this.prismaService.suppliers.createMany({
      data: payload.suppliers,
      skipDuplicates: true,
    });
  }

  async getSuppliers() {
    return await this.prismaService.suppliers.findMany();
  }

  async updateSuppliers(id: string, data: UpdateSuppliersDTO) {
    const numericId = parseInt(id, 10);

    const supplier = await this.prismaService.suppliers.findUnique({
      where: { id: numericId },
    });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado no sistema.');
    }

    return await this.prismaService.suppliers.update({
      where: { id: numericId },
      data,
    });
  }

  async deleteSuppliers(id: string) {
    const numericId = parseInt(id, 10);

    const supplier = await this.prismaService.suppliers.findUnique({
      where: { id: numericId },
    });

    if (!supplier) {
      throw new NotFoundException('Fornecedor não encontrado no sistema.');
    }

    return await this.prismaService.suppliers.delete({
      where: { id: numericId },
    });
  }
}
