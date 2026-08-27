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
          await prisma.product_monthly_data.updateMany({
            where: {
              product_id: prod.product_id,
              store_id: monthData.store_id,
              reference_month: new Date(monthData.reference_month),
            },
            data: {
              barcode: prod.base_data.barcode,
              obs: prod.base_data.obs,
              is_new: prod.base_data.is_new,
              correct_icms_office: prod.base_data.correct_icms_office,
              was_st: prod.base_data.was_st,
              made_in_store: prod.base_data.made_in_store,
              monitored: prod.base_data.monitored,
              department: prod.base_data.department,
              section: prod.base_data.section,
              category_group: prod.base_data.category_group,
              plucode: prod.base_data.plucode,
              description: prod.base_data.description,

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
            },
          });
        }
      }
      return { success: true, updatedCount: products.length };
    });
  }
}
