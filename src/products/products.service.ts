import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProductsService {
  private cache = new Map<string, { data: any; exp: number }>();

  constructor(private prisma: PrismaService) {}

  async getProductsFromMonth(monthStr: string) {
    if (!monthStr) {
      throw new BadRequestException('Data não encontrada!');
    }

    const cacheKey = `products_ytd_${monthStr}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.exp > Date.now()) {
      return cached.data;
    }

    const referenceDate = new Date(`${monthStr}T00:00:00.000Z`);

    if (isNaN(referenceDate.getTime())) {
      throw new BadRequestException(
        'Formato de data inválido. Use YYYY-MM-DD.',
      );
    }

    const year = referenceDate.getUTCFullYear();
    const startOfYear = new Date(Date.UTC(year, 0, 1));

    const whereClause: any = {
      reference_month: {
        gte: startOfYear,
        lte: referenceDate,
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

    this.cache.set(cacheKey, {
      data: monthlyData,
      exp: Date.now() + 1000 * 60 * 15,
    });

    return monthlyData;
  }

  async bulkUpdate(products: any[]) {
    if (!products || products.length === 0)
      return { success: true, updatedCount: 0 };

    this.cache.clear();

    return await this.prisma.$transaction(
      async (prisma) => {
        const firstMonthData = products[0]?.monthly_data[0];
        if (firstMonthData && firstMonthData.reference_month) {
          const targetMonth = new Date(firstMonthData.reference_month)
            .toISOString()
            .substring(0, 7);
          const isLocked =
            await prisma.$queryRaw`SELECT * FROM "locked_months" WHERE month = ${targetMonth}`;
          if ((isLocked as any[]).length > 0) {
            throw new BadRequestException(
              'Este mês está bloqueado pelo cadeado e não pode ser alterado.',
            );
          }
        }

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
              const storeInfo = await prisma.stores.findUnique({
                where: { id: firstMonthData.store_id },
                select: { number: true },
              });
              const isLapa = storeInfo?.number === 3;

              if (firstMonthData.barcode && firstMonthData.barcode !== '-') {
                const ex = await prisma.product_monthly_data.findFirst({
                  where: {
                    barcode: firstMonthData.barcode,
                    stores: {
                      number: isLapa ? 3 : { not: 3 },
                    },
                  },
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
                  where: {
                    plucode: firstMonthData.plucode,
                    stores: {
                      number: isLapa ? 3 : { not: 3 },
                    },
                  },
                  select: { product_id: true },
                });
                if (ex) foundId = ex.product_id;
              }
            }

            if (!foundId) {
              const newProduct = await prisma.products.create({ data: {} });
              foundId = newProduct.id;
            }
            productId = foundId;
          }

          const monthlyPromises = prod.monthly_data.map(
            async (monthData: any) => {
              const barcode = String(monthData.barcode || '').trim();
              const plucode = String(monthData.plucode || '').trim();

              const hasBarcode =
                barcode !== '' &&
                barcode !== '-' &&
                barcode !== 'null' &&
                barcode !== 'undefined';
              const hasPlu =
                plucode !== '' &&
                plucode !== '-' &&
                plucode !== 'null' &&
                plucode !== 'undefined';

              if (!hasBarcode && !hasPlu) {
                return;
              }

              const hasLastPurchaseData =
                monthData.supplier_last_purchase != null ||
                monthData.supplier_intern_code_last_purchase != null ||
                monthData.note_number_last_purchase != null ||
                monthData.access_key_last_purchase != null ||
                monthData.date_last_purchase != null ||
                monthData.ncm_last_purchase != null ||
                monthData.cest_last_purchase != null ||
                monthData.c_class_last_purchase != null ||
                monthData.cbenef_last_purchase != null ||
                monthData.pis_cofins_last_purchase != null ||
                monthData.icms_aliquot_last_purchase != null;

              const dataPayload: any = {
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
              };

              if (hasLastPurchaseData) {
                dataPayload.supplier_last_purchase =
                  monthData.supplier_last_purchase;
                dataPayload.supplier_intern_code_last_purchase =
                  monthData.supplier_intern_code_last_purchase;
                dataPayload.note_number_last_purchase =
                  monthData.note_number_last_purchase;
                dataPayload.access_key_last_purchase =
                  monthData.access_key_last_purchase;
                dataPayload.date_last_purchase = monthData.date_last_purchase;
                dataPayload.ncm_last_purchase = monthData.ncm_last_purchase;
                dataPayload.cest_last_purchase = monthData.cest_last_purchase;
                dataPayload.c_class_last_purchase =
                  monthData.c_class_last_purchase;
                dataPayload.cbenef_last_purchase =
                  monthData.cbenef_last_purchase;
                dataPayload.pis_cofins_last_purchase =
                  monthData.pis_cofins_last_purchase;
                dataPayload.icms_aliquot_last_purchase =
                  monthData.icms_aliquot_last_purchase;
              }

              const existingRecord =
                await prisma.product_monthly_data.findFirst({
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
            },
          );

          await Promise.all(monthlyPromises);
        }
        return { success: true, updatedCount: products.length };
      },
      {
        timeout: 60000,
      },
    );
  }

  async getLockedMonths() {
    const locks = await this.prisma.$queryRaw`SELECT * FROM "locked_months"`;
    return (locks as any[]).map((l) => l.month);
  }

  async toggleLockMonth(month: string) {
    const existing = await this.prisma
      .$queryRaw`SELECT * FROM "locked_months" WHERE month = ${month}`;
    if ((existing as any[]).length > 0) {
      await this.prisma
        .$queryRaw`DELETE FROM "locked_months" WHERE month = ${month}`;
      return { locked: false };
    } else {
      await this.prisma
        .$queryRaw`INSERT INTO "locked_months" (month) VALUES (${month})`;
      return { locked: true };
    }
  }

  async getProductsForProcessor(storeId: string) {
    if (!storeId) {
      throw new BadRequestException('ID da loja é obrigatório');
    }

    const store = await this.prisma.stores.findUnique({
      where: { id: storeId },
      select: { number: true },
    });

    if (!store) {
      throw new BadRequestException('Loja não encontrada');
    }

    const isLapa = store.number === 3;

    const data = await this.prisma.product_monthly_data.findMany({
      where: {
        stores: {
          number: isLapa ? 3 : { not: 3 },
        },
        plucode: { not: null, notIn: ['', '-'] },
      },
      select: {
        plucode: true,
        barcode: true,
        description: true,
        ncm: true,
        pis_cofins: true,
        icms_aliquot: true,
        cest: true,
        c_class: true,
        cbenef: true,
        department: true,
        section: true,
        category_group: true,
        stores: {
          select: { number: true },
        },
      },
      orderBy: { reference_month: 'desc' },
      distinct: ['plucode'],
    });

    return data.map((item) => ({
      ...item,
      stores: { number: store.number },
    }));
  }

  async getAvailableMonths() {
    const months = await this.prisma.product_monthly_data.findMany({
      select: { reference_month: true },
      distinct: ['reference_month'],
      orderBy: { reference_month: 'asc' },
    });
    return months.map((m) => m.reference_month.toISOString().split('T')[0]);
  }

  async deleteProduct(id: string) {
    this.cache.clear();

    return await this.prisma.products.delete({ where: { id } });
  }
}
