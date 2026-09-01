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
        let productId = prod.product_id;

        if (String(productId).startsWith('temp_')) {
          const firstMonthData = prod.monthly_data[0];
          if (!firstMonthData) continue;

          let foundId: string | null = null;
          if (firstMonthData.barcode && firstMonthData.barcode !== '-') {
            const ex = await prisma.product_monthly_data.findFirst({
              where: { barcode: firstMonthData.barcode },
              select: { product_id: true },
            });
            if (ex) foundId = ex.product_id;
          }
          if (
            !foundId &&
            firstMonthData.plucode &&
            firstMonthData.plucode !== '-'
          ) {
            const ex = await prisma.product_monthly_data.findFirst({
              where: { plucode: firstMonthData.plucode },
              select: { product_id: true },
            });
            if (ex) foundId = ex.product_id;
          }
          if (!foundId) {
            const newProduct = await prisma.products.create({ data: {} });
            foundId = newProduct.id;
          }
          productId = foundId;
        }

        for (const monthData of prod.monthly_data) {
          const dataPayload = {
            barcode: monthData.barcode,
            obs: monthData.obs,
            is_new:
              monthData.is_new !== '-' && monthData.is_new !== ''
                ? monthData.is_new
                : null,
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

            ncm_mix_fiscal: monthData.ncm_mix_fiscal,
            cest_mix_fiscal: monthData.cest_mix_fiscal,
            c_class_mix_fiscal: monthData.c_class_mix_fiscal,
            cbenef_mix_fiscal: monthData.cbenef_mix_fiscal,
            pis_cofins_mix_fiscal: monthData.pis_cofins_mix_fiscal,
            icms_aliquot_mix_fiscal_stores:
              monthData.icms_aliquot_mix_fiscal_stores,
            icms_aliquot_mix_fiscal_jasps:
              monthData.icms_aliquot_mix_fiscal_jasps,

            supplier_last_sale: monthData.supplier_last_sale,
            supplier_intern_code_last_sale:
              monthData.supplier_intern_code_last_sale,
            note_number_last_sale: monthData.note_number_last_sale,
            access_key_last_sale: monthData.access_key_last_sale,
            date_last_sale: monthData.date_last_sale,
            ncm_last_sale: monthData.ncm_last_sale,
            cest_last_sale: monthData.cest_last_sale,
            c_class_last_sale: monthData.c_class_last_sale,
            cbenef_last_sale: monthData.cbenef_last_sale,
            pis_cofins_last_sale: monthData.pis_cofins_last_sale,
            icms_aliquot_last_sale: monthData.icms_aliquot_last_sale,
          };

          const existingRecord = await prisma.product_monthly_data.findFirst({
            where: {
              product_id: productId,
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
                product_id: productId,
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

  async deleteProduct(id: string) {
    return await this.prisma.products.delete({ where: { id } });
  }
}
