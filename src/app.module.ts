import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SuppliersModule } from './suppliers/suppliers.module';
import { SuppliersService } from './suppliers/suppliers.service';
import { Middleware } from './middleware';
import { NotesRuralSuppliersModule } from './notes-rural-suppliers/notes-rural-suppliers.module';
import { DailySalesModule } from './daily-sales/daily-sales.module';
import { StoresModule } from './stores/stores.module';
import { ReleasesModule } from './releases/releases.module';

@Module({
  imports: [
    SuppliersModule,
    NotesRuralSuppliersModule,
    DailySalesModule,
    StoresModule,
    ReleasesModule,
  ],
  controllers: [],
  providers: [SuppliersService, PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Middleware).forRoutes('*');
  }
}
