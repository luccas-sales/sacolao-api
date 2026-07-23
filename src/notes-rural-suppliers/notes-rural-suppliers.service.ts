import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotesRuralSuppliersListDTO } from 'src/dtos/notes-rural-suppliers';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NotesRuralSuppliersService {
  constructor(private prismaService: PrismaService) {}

  async createNotesRuralSuppliers(payload: CreateNotesRuralSuppliersListDTO) {
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

    await this.prismaService.notes_rural_suppliers.createMany({
      data: notes,
    });

    await this.recalculateDuplicates();
    return { message: 'Importado com sucesso' };
  }

  async getNotes() {
    await this.recalculateDuplicates();
    return await this.prismaService.notes_rural_suppliers.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async deleteNote(id: string) {
    const numericId = parseInt(id, 10);

    const note = await this.prismaService.notes_rural_suppliers.findUnique({
      where: { id: numericId },
    });

    if (!note) {
      throw new NotFoundException('Nota fiscal não encontrada no sistema.');
    }

    await this.prismaService.notes_rural_suppliers.delete({
      where: { id: numericId },
    });

    await this.recalculateDuplicates();
    return { message: 'Deletado com sucesso' };
  }

  private async recalculateDuplicates() {
    const duplicates = await this.prismaService.notes_rural_suppliers.groupBy({
      by: ['note_access_key'],
      having: {
        note_access_key: {
          _count: {
            gt: 1,
          },
        },
      },
      where: {
        note_access_key: {
          not: null,
        },
      },
    });

    const duplicateKeys = duplicates.map((d) => d.note_access_key as string);

    if (duplicateKeys.length > 0) {
      await this.prismaService.notes_rural_suppliers.updateMany({
        where: { note_access_key: { in: duplicateKeys }, is_duplicate: false },
        data: { is_duplicate: true },
      });

      await this.prismaService.notes_rural_suppliers.updateMany({
        where: {
          note_access_key: { notIn: duplicateKeys },
          is_duplicate: true,
        },
        data: { is_duplicate: false },
      });
    } else {
      await this.prismaService.notes_rural_suppliers.updateMany({
        where: { is_duplicate: true },
        data: { is_duplicate: false },
      });
    }
  }
}
