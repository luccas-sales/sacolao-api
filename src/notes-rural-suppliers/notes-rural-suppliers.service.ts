import { Injectable } from '@nestjs/common';
import { CreateNotesRuralSuppliersListDTO } from 'src/dtos/notes-rural-suppliers';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NotesRuralSuppliersService {
  constructor(private prismaService: PrismaService) {}

  async CreateNotesRuralSuppliers(payload: CreateNotesRuralSuppliersListDTO) {
    const suppliers = await this.prismaService.suppliers.findMany({
      select: {
        tax_id: true,
        legal_name: true,
        sector: true,
      },
    });

    const suppliersMap = new Map(
      suppliers.map((s) => [
        s.tax_id,
        { name: s.legal_name, sector: s.sector },
      ]),
    );

    const incomingAccessKeys = payload.notes
      .map((n) => n.note_access_key)
      .filter((key): key is string => Boolean(key));

    const existingNotes =
      await this.prismaService.notes_rural_suppliers.findMany({
        where: {
          note_access_key: { in: incomingAccessKeys },
        },
        select: { note_access_key: true },
      });

    const existingKeysSet = new Set(
      existingNotes.map((n) => n.note_access_key),
    );

    const notes = payload.notes.map((item) => {
      const supplierInfo = suppliersMap.get(item.supplier_tax_id);

      const isDuplicate = item.note_access_key
        ? existingKeysSet.has(item.note_access_key)
        : false;

      return {
        supplier_tax_id: item.supplier_tax_id,
        supplier_name: supplierInfo ? supplierInfo.name : null,
        sector: supplierInfo ? supplierInfo.sector : null,
        note: item.note || null,
        note_access_key: item.note_access_key || null,
        note_date: item.note_date ? new Date(item.note_date) : null,
        issuer_tax_id: item.issuer_tax_id || null,
        store_name: item.store_name || null,
        receipt: item.receipt || null,
        receipt_access_key: item.receipt_access_key || null,
        receipt_date: item.receipt_date ? new Date(item.receipt_date) : null,
        value: item.value || null,
        status: item.status || '000',
        is_duplicate: isDuplicate,
      };
    });

    return await this.prismaService.notes_rural_suppliers.createMany({
      data: notes,
    });
  }

  async getNotes() {
    return await this.prismaService.notes_rural_suppliers.findMany({
      orderBy: { created_at: 'desc' },
    });
  }
}
