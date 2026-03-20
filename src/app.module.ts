import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SuppliersModule } from './suppliers/suppliers.module';
import { SuppliersDescriptionsModule } from './suppliers-descriptions/suppliers-descriptions.module';
import { SuppliersService } from './suppliers/suppliers.service';
import { SuppliersDescriptionsService } from './suppliers-descriptions/suppliers-descriptions.service';
import { Middleware } from './middleware';

@Module({
  imports: [SuppliersModule, SuppliersDescriptionsModule],
  controllers: [],
  providers: [SuppliersService, SuppliersDescriptionsService, PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Middleware).forRoutes('*');
  }
}
