import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SuppliersModule } from './suppliers/suppliers.module';
import { SuppliersService } from './suppliers/suppliers.service';
import { Middleware } from './middleware';
import { NotesRuralSuppliersController } from './notes-rural-suppliers/notes-rural-suppliers.controller';
import { NotesRuralSuppliersModule } from './notes-rural-suppliers/notes-rural-suppliers.module';

@Module({
  imports: [SuppliersModule, NotesRuralSuppliersModule],
  controllers: [NotesRuralSuppliersController],
  providers: [SuppliersService, PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Middleware).forRoutes('*');
  }
}
