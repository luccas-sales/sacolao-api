import { Body, Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { NotesRuralSuppliersService } from './notes-rural-suppliers.service';
import { CreateNotesRuralSuppliersListDTO } from '../dtos/notes-rural-suppliers';

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
}
