import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockTakeDto } from './dto/create-stock-take.dto';
import { UpdateStockTakeDto } from './dto/update-stock-take.dto';
import { Prisma, StockTakeStatus } from '@prisma/client';

@Injectable()
export class StockTakesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStockTakeDto) {
    // Generate stock take number
    const count = await this.prisma.stockTake.count();
    const stockTakeNumber = `ST${String(count + 1).padStart(6, '0')}`;

    // Get current stock for all items
    const itemIds = dto.items.map((i) => i.itemId);
    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: { id: { in: itemIds } },
    });

    return this.prisma.stockTake.create({
      data: {
        stockTakeNumber,
        title: dto.title,
        description: dto.description,
        createdById: dto.createdById,
        items: {
          createMany: {
            data: dto.items.map((item) => {
              const invItem = inventoryItems.find((i) => i.id === item.itemId);
              const systemQty = invItem?.currentStock || 0;
              const difference = item.actualQty - systemQty;

              return {
                itemId: item.itemId,
                systemQty,
                actualQty: item.actualQty,
                difference,
                notes: item.notes,
              };
            }),
          },
        },
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  findAll(status?: string) {
    const where: Prisma.StockTakeWhereInput = {};

    if (status) {
      where.status = status as StockTakeStatus;
    }
    return this.prisma.stockTake.findMany({
      where,
      include: {
        items: {
          include: {
            item: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const stockTake = await this.prisma.stockTake.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            item: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!stockTake) {
      throw new NotFoundException(`Stock take #${id} not found`);
    }

    return stockTake;
  }

  async update(id: number, dto: UpdateStockTakeDto) {
    const stockTake = await this.findOne(id);

    if (stockTake.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Can only update IN_PROGRESS stock takes');
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete old items if provided
      if (dto.items) {
        await tx.stockTakeItem.deleteMany({
          where: { stockTakeId: id },
        });

        // Get current stock for all items
        const itemIds = dto.items.map((i) => i.itemId);
        const inventoryItems = await tx.inventoryItem.findMany({
          where: { id: { in: itemIds } },
        });

        // Create new items
        await tx.stockTakeItem.createMany({
          data: dto.items.map((item) => {
            const invItem = inventoryItems.find((i) => i.id === item.itemId);
            const systemQty = invItem?.currentStock || 0;
            const difference = item.actualQty - systemQty;

            return {
              stockTakeId: id,
              itemId: item.itemId,
              systemQty,
              actualQty: item.actualQty,
              difference,
              notes: item.notes,
            };
          }),
        });
      }

      // Update stock take
      return tx.stockTake.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
        },
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      });
    });
  }

  async complete(id: number) {
    const stockTake = await this.findOne(id);

    if (stockTake.status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Can only complete IN_PROGRESS stock takes',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Update stock take status
      const completed = await tx.stockTake.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedDate: new Date(),
        },
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      });

      // Adjust inventory for each item with difference
      for (const item of completed.items) {
        if (item.difference !== 0) {
          const balanceBefore = item.systemQty;
          const balanceAfter = item.actualQty;

          // Update inventory stock
          await tx.inventoryItem.update({
            where: { id: item.itemId },
            data: { currentStock: balanceAfter },
          });

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              itemId: item.itemId,
              type: 'STOCKTAKE',
              quantity: item.difference,
              unit: item.item.baseUnit,
              balanceBefore,
              balanceAfter,
              stockTakeId: id,
              notes: `Stock take ${completed.stockTakeNumber}${item.notes ? ` - ${item.notes}` : ''}`,
            },
          });
        }
      }

      return completed;
    });
  }

  async cancel(id: number) {
    const stockTake = await this.findOne(id);

    if (stockTake.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel COMPLETED stock takes');
    }

    return this.prisma.stockTake.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const stockTake = await this.findOne(id);

    if (stockTake.status === 'COMPLETED') {
      throw new BadRequestException('Cannot delete COMPLETED stock takes');
    }

    return this.prisma.stockTake.delete({
      where: { id },
    });
  }
}
