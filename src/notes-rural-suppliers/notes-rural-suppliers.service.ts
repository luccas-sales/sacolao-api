import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateNotesRuralSuppliersListDTO,
  UpdateNoteRuralSuppliersDTO,
} from 'src/dtos/notes-rural-suppliers';
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

    for (const item of payload.notes) {
      const supplierInfo = suppliersMap.get(item.supplier_tax_id);
      const supplierName = supplierInfo ? supplierInfo.name : null;
      const sector = supplierInfo ? supplierInfo.sector : null;

      const existingNote =
        await this.prismaService.notes_rural_suppliers.findFirst({
          where: {
            OR: [
              {
                note_access_key: item.note_access_key
                  ? item.note_access_key
                  : undefined,
              },
              {
                receipt_access_key: item.receipt_access_key
                  ? item.receipt_access_key
                  : undefined,
              },
            ].filter((condition) => Object.values(condition)[0] !== undefined),
          },
        });

      if (existingNote) {
        const isIncomingProducerNote =
          !item.receipt_access_key && Boolean(item.note_access_key);

        await this.prismaService.notes_rural_suppliers.update({
          where: { id: existingNote.id },
          data: {
            note: isIncomingProducerNote
              ? item.note || existingNote.note
              : existingNote.note || item.note || null,

            note_access_key: isIncomingProducerNote
              ? item.note_access_key || existingNote.note_access_key
              : existingNote.note_access_key || item.note_access_key || null,

            note_date: isIncomingProducerNote
              ? item.note_date
                ? new Date(item.note_date)
                : existingNote.note_date
              : existingNote.note_date ||
                (item.note_date ? new Date(item.note_date) : null),

            receipt: item.receipt || existingNote.receipt || null,
            receipt_access_key:
              item.receipt_access_key ||
              existingNote.receipt_access_key ||
              null,
            receipt_date: item.receipt_date
              ? new Date(item.receipt_date)
              : existingNote.receipt_date,
            issuer_tax_id:
              item.issuer_tax_id || existingNote.issuer_tax_id || null,
            store_name: item.store_name || existingNote.store_name || null,

            status:
              (existingNote.receipt_access_key || item.receipt_access_key) &&
              (existingNote.note_access_key || item.note_access_key)
                ? '100'
                : item.status !== '000'
                  ? item.status
                  : existingNote.status,
          },
        });
        continue;
      }

      await this.prismaService.notes_rural_suppliers.create({
        data: {
          supplier_tax_id: item.supplier_tax_id,
          supplier_name: supplierName,
          sector: sector,
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
          is_duplicate: false,
        },
      });
    }

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

  async updateNote(id: string, data: UpdateNoteRuralSuppliersDTO) {
    const numericId = parseInt(id, 10);

    const note = await this.prismaService.notes_rural_suppliers.findUnique({
      where: { id: numericId },
    });

    if (!note) {
      throw new NotFoundException('Nota não encontrada no sistema.');
    }

    const dataToUpdate = {
      ...data,
      ...(data.note_date && { note_date: new Date(data.note_date) }),
      ...(data.receipt_date && { receipt_date: new Date(data.receipt_date) }),
    };

    const updatedNote = await this.prismaService.notes_rural_suppliers.update({
      where: { id: numericId },
      data: dataToUpdate,
    });

    await this.recalculateDuplicates();
    return updatedNote;
  }

  async getDanfe(receiptAccessKey: string) {
    try {
      const response = await fetch(
        'https://consultadanfe.com/api/v1/consulta',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chave: receiptAccessKey,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();

        if (data.status === 'ok' && data.pdf_base64) {
          return data.pdf_base64;
        }
      }
    } catch (error) {
      console.warn(
        `(consultadanfe.com) Falha na consultando para a chave ${receiptAccessKey}:`,
        error,
      );
    }

    try {
      const response = await fetch(
        `https://api.meudanfe.com.br/v2/fd/get/da/${receiptAccessKey}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (response.ok) {
        const result = await response.json();

        if (result.data) {
          return result.data;
        }
      }
    } catch (error) {
      console.warn(
        `(meudanfe.com) Falha na consultando para a chave ${receiptAccessKey}:`,
        error,
      );
    }

    try {
      const response = await fetch(
        `https://api.meudanfe.com.br/v2/fd/add/${receiptAccessKey}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'api-key': process.env.MEU_DANFE_TOKEN || '',
          },
        },
      );

      if (!response.ok) {
        console.warn(
          `(meudanfe.com) Falha ao adicionar a nota com chave ${receiptAccessKey}: ${response.status}`,
        );
      }
    } catch (error) {
      console.warn(
        `(meudanfe.com) Falha ao adicionar a nota com chave ${receiptAccessKey}:`,
        error,
      );
    }

    for (let attempt = 1; attempt <= 4; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const response = await fetch(
          `https://api.meudanfe.com.br/v2/fd/get/da/${receiptAccessKey}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'api-key': process.env.MEU_DANFE_TOKEN || '',
            },
          },
        );

        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            return result.data;
          }
        }
      } catch (error) {
        console.warn(
          `(meudanfe.com) Tentativa de consultar ${attempt}/4 falhou:`,
          error,
        );
      }
    }

    throw new BadRequestException(
      `Não foi possível resgatar o DANFE para a chave ${receiptAccessKey}. Verifique se o status do SEFAZ ou se há pendências no serviço.`,
    );
  }

  private async recalculateDuplicates() {
    const inactiveStatuses = ['101', '151', '110'];

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
        status: {
          notIn: inactiveStatuses,
        },
      },
    });

    const duplicateKeys = duplicates.map((d) => d.note_access_key as string);

    await this.prismaService.notes_rural_suppliers.updateMany({
      where: {
        status: { in: inactiveStatuses },
        is_duplicate: true,
      },
      data: { is_duplicate: false },
    });

    if (duplicateKeys.length > 0) {
      await this.prismaService.notes_rural_suppliers.updateMany({
        where: {
          note_access_key: { in: duplicateKeys },
          status: { notIn: inactiveStatuses },
          is_duplicate: false,
        },
        data: { is_duplicate: true },
      });

      await this.prismaService.notes_rural_suppliers.updateMany({
        where: {
          note_access_key: { notIn: duplicateKeys },
          status: { notIn: inactiveStatuses },
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
