import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { ProductModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ZonesModule } from './zones/zones.module';
import { TablesModule } from './tables/tables.module';

@Module({
  imports: [CategoriesModule, ProductModule, PrismaModule, OrdersModule, AuthModule, UsersModule, ZonesModule, TablesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
