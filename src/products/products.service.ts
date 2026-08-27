import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getProductsFromMonth(monthStr: string) {
    if (!monthStr) {
      throw new BadRequestException('Data não encontrada!');
    }

    const referenceDate = new Date(monthStr);

    if (isNaN(referenceDate.getTime())) {
      throw new BadRequestException(
        'Formato de data inválido. Use YYYY-MM-DD.',
      );
    }

    const whereClause: any = {
      reference_month: {
        gte: referenceDate,
      },
    };

    const monthlyData = await this.prisma.product_monthly_data.findMany({
      where: whereClause,
      include: {
        products: true,
        stores: true,
      },
      orderBy: [{ reference_month: 'asc' }, { description: 'asc' }],
    });

    return monthlyData;
  }

  async bulkUpdate(products: any[]) {
    if (!products || products.length === 0)
      return { success: true, updatedCount: 0 };

    return await this.prisma.$transaction(async (prisma) => {
      for (const prod of products) {
        for (const monthData of prod.monthly_data) {
          const dataPayload = {
            barcode: monthData.barcode,
            obs: monthData.obs,
            is_new: monthData.is_new,
            correct_icms_office: monthData.correct_icms_office,
            was_st: monthData.was_st,
            made_in_store: monthData.made_in_store,
            monitored: monthData.monitored,
            department: monthData.department,
            section: monthData.section,
            category_group: monthData.category_group,
            plucode: monthData.plucode,
            description: monthData.description,
            icms: monthData.icms,
            icms_aliquot: monthData.icms_aliquot,
            cest: monthData.cest,
            cbenef: monthData.cbenef,
            c_class: monthData.c_class,
            ncm: monthData.ncm,
            pis_cofins: monthData.pis_cofins,
            billing:
              monthData.billing !== undefined && monthData.billing !== null
                ? String(monthData.billing)
                : null,
            pis_cofins_last_sale: monthData.pis_cofins_last_sale,
            icms_aliquot_last_sale: monthData.icms_aliquot_last_sale,
            cest_last_sale: monthData.cest_last_sale,
            c_class_last_sale: monthData.c_class_last_sale,
            cbenef_last_sale: monthData.cbenef_last_sale,
          };

          const existingRecord = await prisma.product_monthly_data.findFirst({
            where: {
              product_id: prod.product_id,
              store_id: monthData.store_id,
              reference_month: new Date(monthData.reference_month),
            },
          });

          if (existingRecord) {
            await prisma.product_monthly_data.update({
              where: { id: existingRecord.id },
              data: dataPayload,
            });
          } else {
            await prisma.product_monthly_data.create({
              data: {
                product_id: prod.product_id,
                store_id: monthData.store_id,
                reference_month: new Date(monthData.reference_month),
                ...dataPayload,
              },
            });
          }
        }
      }
      return { success: true, updatedCount: products.length };
    });
  }
}
