// File: backend/src/categories/categories.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service'; // <-- 1. Import Prisma

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {} // <-- 2. Tiêm Prisma vào

  create(createCategoryDto: CreateCategoryDto) {
    // 3. Thêm logic tạo Category
    return this.prisma.category.create({ data: createCategoryDto });
  }

  findAll() {
    // 4. Thêm logic lấy tất cả Category
    return this.prisma.category.findMany();
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id); // Kiểm tra tồn tại
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Kiểm tra tồn tại
    return this.prisma.category.delete({
      where: { id },
    });
  }
}