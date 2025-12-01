import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.supplier.findMany({
      include: {
        purchaseOrders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier #${id} not found`);
    }

    return supplier;
  }

  async update(id: number, dto: UpdateSupplierDto) {
    await this.findOne(id);
    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}
