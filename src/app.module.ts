import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SuppliersModule } from './suppliers/suppliers.module';
import { Middleware } from './middleware';
import { NotesRuralSuppliersModule } from './notes-rural-suppliers/notes-rural-suppliers.module';
import { DailySalesModule } from './daily-sales/daily-sales.module';
import { StoresModule } from './stores/stores.module';
import { ReleasesModule } from './releases/releases.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    SuppliersModule,
    NotesRuralSuppliersModule,
    DailySalesModule,
    StoresModule,
    ReleasesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(Middleware)
      .exclude(
        { path: 'updates/(.*)', method: RequestMethod.ALL },
        { path: 'auth/signin', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
