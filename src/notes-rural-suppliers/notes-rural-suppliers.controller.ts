import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Put,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { NotesRuralSuppliersService } from './notes-rural-suppliers.service';
import {
  CreateNotesRuralSuppliersListDTO,
  UpdateNoteRuralSuppliersDTO,
} from '../dtos/notes-rural-suppliers';

@Controller('notes-rural-suppliers')
export class NotesRuralSuppliersController {
  constructor(private notesService: NotesRuralSuppliersService) {}

  @Post('import')
  async importNotes(@Body() body: CreateNotesRuralSuppliersListDTO) {
    return await this.notesService.createNotesRuralSuppliers(body);
  }

  @Get()
  async getNotes() {
    return await this.notesService.getNotes();
  }

  @Delete(':id')
  async deleteNote(@Param('id') id: string) {
    return await this.notesService.deleteNote(id);
  }

  @Put(':id')
  async updateNote(
    @Param('id') id: string,
    @Body() body: UpdateNoteRuralSuppliersDTO,
  ) {
    return await this.notesService.updateNote(id, body);
  }

  @Post('danfe')
  async getDanfe(@Body('receiptAccessKey') receiptAccessKey: string) {
    const pdf = await this.notesService.getDanfe(receiptAccessKey);

    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: 'inline; filename="danfe.pdf"',
    });
  }
}
