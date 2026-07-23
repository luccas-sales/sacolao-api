import { Module } from '@nestjs/common';
import { NotesRuralSuppliersController } from './notes-rural-suppliers.controller';
import { NotesRuralSuppliersService } from './notes-rural-suppliers.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [NotesRuralSuppliersController],
  providers: [NotesRuralSuppliersService, PrismaService],
})
export class NotesRuralSuppliersModule {}
