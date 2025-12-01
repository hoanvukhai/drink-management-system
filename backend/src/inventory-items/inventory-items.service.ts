import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { AdjustStockDto, AdjustmentType } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryItemsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: {
        ...dto,
        currentStock: dto.currentStock ?? 0,
        minStock: dto.minStock ?? 0,
      },
      include: {
        category: true,
      },
    });
  }

  findAll() {
    return this.prisma.inventoryItem.findMany({
      include: {
        category: true,
        unitConversions: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // Lấy items sắp hết hàng
  findLowStock() {
    return this.prisma.inventoryItem.findMany({
      where: {
        currentStock: {
          lte: this.prisma.inventoryItem.fields.minStock,
        },
      },
      include: {
        category: true,
      },
      orderBy: { currentStock: 'asc' },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        category: true,
        unitConversions: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item #${id} not found`);
    }

    return item;
  }

  async update(id: number, dto: UpdateInventoryItemDto) {
    await this.findOne(id);
    return this.prisma.inventoryItem.update({
      where: { id },
      data: dto,
      include: {
        category: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.inventoryItem.delete({
      where: { id },
    });
  }

  // Điều chỉnh tồn kho
  async adjustStock(id: number, dto: AdjustStockDto) {
    const item = await this.findOne(id);

    let newStock = item.currentStock;
    switch (dto.type) {
      case AdjustmentType.ADD:
        newStock += dto.quantity;
        break;
      case AdjustmentType.SUBTRACT:
        newStock -= dto.quantity;
        if (newStock < 0) {
          throw new BadRequestException('Stock cannot be negative');
        }
        break;
      case AdjustmentType.SET:
        newStock = dto.quantity;
        break;
    }

    const balanceBefore = item.currentStock;

    return this.prisma.$transaction(async (tx) => {
      // Update stock
      await tx.inventoryItem.update({
        where: { id },
        data: { currentStock: newStock },
      });

      // Create transaction log
      await tx.inventoryTransaction.create({
        data: {
          itemId: id,
          type: 'ADJUSTMENT',
          quantity:
            dto.type === AdjustmentType.SET
              ? newStock - balanceBefore
              : dto.quantity,
          unit: item.baseUnit,
          balanceBefore,
          balanceAfter: newStock,
          userId: dto.userId,
          notes: `${dto.reason}${dto.notes ? ` - ${dto.notes}` : ''}`,
        },
      });

      return tx.inventoryItem.findUnique({
        where: { id },
        include: { category: true },
      });
    });
  }
}
