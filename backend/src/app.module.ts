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
import { RecipesModule } from './recipes/recipes.module';
import { InventoryCategoriesModule } from './inventory-categories/inventory-categories.module';
import { InventoryItemsModule } from './inventory-items/inventory-items.module';
import { ConsumptionTrackingModule } from './consumption-tracking/consumption-tracking.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { StockTakesModule } from './stock-takes/stock-takes.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ShiftsModule } from './shifts/shifts.module';
import { ExpensesModule } from './expenses/expenses.module';
import { HrModule } from './hr/hr.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { ShiftsModule } from './shifts/shifts.module';

@Module({
  imports: [
    CategoriesModule,
    ProductModule,
    PrismaModule,
    OrdersModule,
    AuthModule,
    UsersModule,
    ZonesModule,
    TablesModule,
    RecipesModule,
    InventoryCategoriesModule,
    InventoryItemsModule,
    ConsumptionTrackingModule,
    SuppliersModule,
    PurchaseOrdersModule,
    StockTakesModule,
    AttendanceModule,
    ShiftsModule,
    IngredientsModule,
    HrModule,
    ExpensesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
