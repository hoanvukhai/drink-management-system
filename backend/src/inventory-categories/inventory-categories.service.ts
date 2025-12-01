import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryCategoryDto } from './dto/create-inventory-category.dto';
import { UpdateInventoryCategoryDto } from './dto/update-inventory-category.dto';

@Injectable()
export class InventoryCategoriesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateInventoryCategoryDto) {
    return this.prisma.inventoryCategory.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.inventoryCategory.findMany({
      include: {
        items: {
          select: {
            id: true,
            name: true,
            currentStock: true,
            minStock: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.inventoryCategory.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Inventory category #${id} not found`);
    }

    return category;
  }

  async update(id: number, dto: UpdateInventoryCategoryDto) {
    await this.findOne(id);
    return this.prisma.inventoryCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.inventoryCategory.delete({
      where: { id },
    });
  }
}
