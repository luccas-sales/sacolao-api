import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NotesRuralSuppliersService } from './notes-rural-suppliers.service';
import {
  CreateNotesRuralSuppliersListDTO,
  UpdateNoteRuralSuppliersDTO,
} from '../dtos/notes-rural-suppliers';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
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
    const pdfBase64 = await this.notesService.getDanfe(receiptAccessKey);

    return {
      pdf_base64: pdfBase64,
    };
  }
}
