import { Module } from '@nestjs/common';
import { InventoryCategoriesService } from './inventory-categories.service';
import { InventoryCategoriesController } from './inventory-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryCategoriesController],
  providers: [InventoryCategoriesService],
})
export class InventoryCategoriesModule {}
