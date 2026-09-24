import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateSuppliersListDTO, UpdateSuppliersDTO } from 'src/dtos/suppliers';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(private prismaService: PrismaService) {}

  async createSuppliers(payload: CreateSuppliersListDTO) {
    this.logger.log(
      `Criando/Atualizando ${payload.suppliers.length} fornecedores.`,
    );

    return await this.prismaService.suppliers.createMany({
      data: payload.suppliers,
      skipDuplicates: true,
    });
  }

  async getSuppliers() {
    this.logger.log('Listando todos os fornecedores');

    return await this.prismaService.suppliers.findMany({
      orderBy: { id: 'desc' },
    });
  }

  async updateSuppliers(id: string, data: UpdateSuppliersDTO) {
    this.logger.log(`Atualizando dados do fornecedor ID: ${id}`);

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
    this.logger.warn(`Deletando fornecedor ID: ${id}`);

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
