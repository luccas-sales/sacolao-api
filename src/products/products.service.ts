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
            billing: monthData.billing,

            icms_mix_fiscal: monthData.icms_mix_fiscal,
            ncm_mix_fiscal: monthData.ncm_mix_fiscal,
            cest_mix_fiscal: monthData.cest_mix_fiscal,
            c_class_mix_fiscal: monthData.c_class_mix_fiscal,
            cbenef_mix_fiscal: monthData.cbenef_mix_fiscal,
            pis_cofins_mix_fiscal: monthData.pis_cofins_mix_fiscal,
            icms_aliquot_mix_fiscal_stores_lapa:
              monthData.icms_aliquot_mix_fiscal_stores_lapa,
            icms_aliquot_mix_fiscal_jasp_hortjasp_frutjasp:
              monthData.icms_aliquot_mix_fiscal_jasp_hortjasp_frutjasp,

            note_number_last_sale: monthData.note_number_last_sale,
            access_key_last_sale: monthData.access_key_last_sale,
            supplier_last_sale: monthData.supplier_last_sale,
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

  async importFromExcel(payload: {
    store_id: string;
    reference_month: string;
    products: any[];
  }) {
    const { store_id, reference_month, products } = payload;
    const refDate = new Date(`${reference_month}-01T00:00:00.000Z`);

    if (!products || products.length === 0) return { success: true, count: 0 };

    return await this.prisma.$transaction(async (prisma) => {
      for (const item of products) {
        let productId: string | null = null;

        if (item.barcode && item.barcode !== '-') {
          const existingByBarcode = await prisma.product_monthly_data.findFirst(
            {
              where: { barcode: item.barcode },
              select: { product_id: true },
            },
          );
          if (existingByBarcode) productId = existingByBarcode.product_id;
        }

        if (!productId && item.plucode && item.plucode !== '-') {
          const existingByPlu = await prisma.product_monthly_data.findFirst({
            where: { plucode: item.plucode },
            select: { product_id: true },
          });
          if (existingByPlu) productId = existingByPlu.product_id;
        }

        if (!productId) {
          const newProduct = await prisma.products.create({
            data: {},
          });
          productId = newProduct.id;
        }

        const dataPayload = {
          is_new:
            item.is_new !== '-' && item.is_new !== '' ? item.is_new : null,
          department: item.department !== '-' ? item.department : null,
          section: item.section !== '-' ? item.section : null,
          category_group:
            item.category_group !== '-' ? item.category_group : null,
          barcode: item.barcode !== '-' ? item.barcode : null,
          plucode: item.plucode !== '-' ? item.plucode : null,
          description: item.description !== '-' ? item.description : null,

          billing: item.billing !== null ? String(item.billing) : null,
          icms: item.icms !== '-' ? item.icms : null,
          icms_aliquot: item.icms_aliquot !== '-' ? item.icms_aliquot : null,
          cest: item.cest !== '-' ? item.cest : null,
          cbenef: item.cbenef !== '-' ? item.cbenef : null,
          c_class: item.c_class !== '-' ? item.c_class : null,
          ncm: item.ncm !== '-' ? item.ncm : null,
          pis_cofins: item.pis_cofins,

          ncm_mix_fiscal:
            item.ncm_mix_fiscal !== '-' ? item.ncm_mix_fiscal : null,
          cest_mix_fiscal:
            item.cest_mix_fiscal !== '-' ? item.cest_mix_fiscal : null,
          c_class_mix_fiscal:
            item.c_class_mix_fiscal !== '-' ? item.c_class_mix_fiscal : null,
          cbenef_mix_fiscal:
            item.cbenef_mix_fiscal !== '-' ? item.cbenef_mix_fiscal : null,
          pis_cofins_mix_fiscal: item.pis_cofins_mix_fiscal,
          icms_aliquot_mix_fiscal:
            item.icms_aliquot_mix_fiscal !== '-'
              ? item.icms_aliquot_mix_fiscal
              : null,

          supplier_last_sale:
            item.supplier_last_sale !== '-' ? item.supplier_last_sale : null,
          note_number_last_sale:
            item.note_number_last_sale !== '-'
              ? item.note_number_last_sale
              : null,
          access_key_last_sale:
            item.access_key_last_sale !== '-'
              ? item.access_key_last_sale
              : null,
          date_last_sale:
            item.date_last_sale !== '-' ? item.date_last_sale : null,
          ncm_last_sale: item.ncm_last_sale !== '-' ? item.ncm_last_sale : null,
          cest_last_sale:
            item.cest_last_sale !== '-' ? item.cest_last_sale : null,
          c_class_last_sale:
            item.c_class_last_sale !== '-' ? item.c_class_last_sale : null,
          cbenef_last_sale:
            item.cbenef_last_sale !== '-' ? item.cbenef_last_sale : null,
          pis_cofins_last_sale: item.pis_cofins_last_sale,
          icms_aliquot_last_sale:
            item.icms_aliquot_last_sale !== '-'
              ? item.icms_aliquot_last_sale
              : null,
        };

        const existingRecord = await prisma.product_monthly_data.findFirst({
          where: {
            product_id: productId,
            store_id: store_id,
            reference_month: refDate,
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
              store_id: store_id,
              reference_month: refDate,
              ...dataPayload,
            },
          });
        }
      }

      return { success: true, count: products.length };
    });
  }
}
