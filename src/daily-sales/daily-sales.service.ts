import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateDailySalesListDTO,
  UpdateDailySaleDTO,
} from 'src/dtos/daily-sales';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DailySalesService {
  constructor(private prismaService: PrismaService) {}

  async createDailySales(payload: CreateDailySalesListDTO) {
    const cnpjs = [...new Set(payload.sales.map((s) => s.store_cnpj))];
    const stores = await this.prismaService.stores.findMany({
      where: { tax_id: { in: cnpjs } },
    });

    const storeMap = new Map(stores.map((s) => [s.tax_id, s.id]));

    for (const item of payload.sales) {
      const storeId = storeMap.get(item.store_cnpj);

      if (!storeId) {
        console.warn(`Loja com CNPJ ${item.store_cnpj} não encontrada.`);
        continue;
      }

      let cashRegister = await this.prismaService.cash_registers.findFirst({
        where: {
          store_id: storeId,
          nfce_series: item.series,
        },
      });

      if (!cashRegister) {
        const nfeSeriesCalculated = 100 + item.series;

        cashRegister = await this.prismaService.cash_registers.create({
          data: {
            store_id: storeId,
            number: item.series,
            nfce_series: item.series,
            nfe_series: nfeSeriesCalculated,
            description: `Caixa ${item.series}`,
          },
        });
      }

      const parsedDate = new Date(item.report_date);

      const existingSale = await this.prismaService.daily_sales.findFirst({
        where: {
          cash_register_id: cashRegister.id,
          report_date: parsedDate,
        },
      });

      if (existingSale) {
        await this.prismaService.daily_sales.update({
          where: { id: existingSale.id },
          data: {
            total_nfce: item.total_nfce ?? existingSale.total_nfce,
            total_nfe: item.total_nfe ?? existingSale.total_nfe,
            total_summary_map:
              item.total_summary_map ?? existingSale.total_summary_map,
          },
        });
        continue;
      }

      await this.prismaService.daily_sales.create({
        data: {
          cash_register_id: cashRegister.id,
          report_date: parsedDate,
          total_nfce: item.total_nfce || 0,
          total_nfe: item.total_nfe || 0,
          total_summary_map: item.total_summary_map || 0,
        },
      });
    }

    return { message: 'Importado com sucesso e caixas sincronizados!' };
  }

  async getSales(storeId?: string, startDate?: string, endDate?: string) {
    const where: any = {};

    if (storeId) {
      where.cash_registers = { store_id: storeId };
    }

    if (startDate || endDate) {
      where.report_date = {};
      if (startDate) where.report_date.gte = new Date(startDate);
      if (endDate) where.report_date.lte = new Date(endDate);
    }

    return await this.prismaService.daily_sales.findMany({
      where,
      include: {
        cash_registers: true,
      },
      orderBy: { report_date: 'desc' },
    });
  }

  async updateSale(id: string, data: UpdateDailySaleDTO) {
    const currentSale = await this.prismaService.daily_sales.findUnique({
      where: { id },
    });

    if (!currentSale) {
      throw new NotFoundException('Venda diária não encontrada no sistema.');
    }

    const updatedSale = await this.prismaService.daily_sales.update({
      where: { id },
      data,
    });

    return updatedSale;
  }
}
