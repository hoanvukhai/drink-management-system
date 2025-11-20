// src/products/products.module.ts (ĐÃ SỬA)
import { Module } from '@nestjs/common';
import { ProductService } from './products.service'; // <-- Sửa lại (bỏ chữ s)
import { ProductController } from './products.controller'; // <-- Sửa lại (bỏ chữ s)
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController], // <-- Sửa lại (bỏ chữ s)
  providers: [ProductService], // <-- Sửa lại (bỏ chữ s)
})
export class ProductModule {}