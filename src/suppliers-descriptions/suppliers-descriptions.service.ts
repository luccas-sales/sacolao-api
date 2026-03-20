import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateSuppliersDescriptionsDTO,
  UpdateSuppliersDescriptionsDTO,
} from 'src/dtos/suppliersDescriptions';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SuppliersDescriptionsService {
  constructor(private prismaService: PrismaService) {}

  async createSuppliersDescriptions(data: CreateSuppliersDescriptionsDTO) {
    const descriptionAlreadyExists =
      await this.prismaService.suppliersDescriptions.findUnique({
        where: { legal_description: data.legal_description },
      });

    if (descriptionAlreadyExists) {
      throw new UnauthorizedException('Descrição já cadastrado');
    }

    return await this.prismaService.suppliersDescriptions.create({
      data: {
        ...data,
      },
    });
  }

  async getSuppliersDescriptions() {
    return await this.prismaService.suppliersDescriptions.findMany();
  }

  async updateSuppliersDescriptions(
    id: string,
    data: UpdateSuppliersDescriptionsDTO,
  ) {
    const numericId = parseInt(id, 10);

    const description =
      await this.prismaService.suppliersDescriptions.findUnique({
        where: { id: numericId },
      });

    if (!description) {
      throw new NotFoundException('Descrição não encontrada no sistema.');
    }

    return await this.prismaService.suppliersDescriptions.update({
      where: { id: numericId },
      data,
    });
  }

  async deleteSuppliersDescriptions(id: string) {
    const numericId = parseInt(id, 10);

    const description =
      await this.prismaService.suppliersDescriptions.findUnique({
        where: { id: numericId },
      });

    if (!description) {
      throw new NotFoundException('Descrição não encontrada no sistema.');
    }

    return await this.prismaService.suppliersDescriptions.delete({
      where: { id: numericId },
    });
  }
}
