import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { CompletePurchaseOrderDto } from './dto/complete-purchase-order.dto';
import { Prisma, PurchaseOrderStatus } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePurchaseOrderDto) {
    // Generate order number
    const count = await this.prisma.purchaseOrder.count();
    const orderNumber = `PO${String(count + 1).padStart(6, '0')}`;

    // Calculate total
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return this.prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId: dto.supplierId,
        createdById: dto.createdById,
        totalAmount,
        notes: dto.notes,
        items: {
          createMany: {
            data: dto.items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
              batchNumber: item.batchNumber,
            })),
          },
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  findAll(status?: string) {
    const where: Prisma.PurchaseOrderWhereInput = {};

    if (status) {
      where.status = status as PurchaseOrderStatus;
    }
    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Purchase order #${id} not found`);
    }

    return order;
  }

  async update(id: number, dto: UpdatePurchaseOrderDto) {
    const order = await this.findOne(id);

    if (order.status !== 'DRAFT') {
      throw new BadRequestException('Can only update DRAFT orders');
    }

    // Recalculate total if items changed
    let totalAmount = order.totalAmount;
    if (dto.items) {
      totalAmount = dto.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete old items if provided
      if (dto.items) {
        await tx.purchaseOrderItem.deleteMany({
          where: { purchaseOrderId: id },
        });
      }

      // Update order
      return tx.purchaseOrder.update({
        where: { id },
        data: {
          supplierId: dto.supplierId,
          totalAmount,
          notes: dto.notes,
          ...(dto.items && {
            items: {
              createMany: {
                data: dto.items.map((item) => ({
                  itemId: item.itemId,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalPrice: item.quantity * item.unitPrice,
                  expiryDate: item.expiryDate
                    ? new Date(item.expiryDate)
                    : null,
                  batchNumber: item.batchNumber,
                })),
              },
            },
          }),
        },
        include: {
          supplier: true,
          items: {
            include: {
              item: true,
            },
          },
        },
      });
    });
  }

  async complete(id: number, dto: CompletePurchaseOrderDto) {
    const order = await this.findOne(id);

    if (order.status !== 'DRAFT') {
      throw new BadRequestException('Can only complete DRAFT orders');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          receivedDate: dto.receivedDate
            ? new Date(dto.receivedDate)
            : new Date(),
        },
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      });

      // Update inventory stock for each item
      for (const orderItem of updatedOrder.items) {
        const currentItem = await tx.inventoryItem.findUnique({
          where: { id: orderItem.itemId },
        });
        if (!currentItem) {
          throw new NotFoundException(
            `Item with ID ${orderItem.itemId} not found`,
          );
        }
        const balanceBefore = currentItem.currentStock;
        const balanceAfter = balanceBefore + orderItem.quantity;

        // Update stock
        await tx.inventoryItem.update({
          where: { id: orderItem.itemId },
          data: {
            currentStock: balanceAfter,
            lastPurchasePrice: orderItem.unitPrice,
            // Update average cost
            averageCost: currentItem.averageCost
              ? (currentItem.averageCost * balanceBefore +
                  orderItem.totalPrice) /
                balanceAfter
              : orderItem.unitPrice,
          },
        });

        // Create inventory transaction
        await tx.inventoryTransaction.create({
          data: {
            itemId: orderItem.itemId,
            type: 'PURCHASE',
            quantity: orderItem.quantity,
            unit: currentItem.baseUnit,
            unitCost: orderItem.unitPrice,
            totalCost: orderItem.totalPrice,
            balanceBefore,
            balanceAfter,
            purchaseOrderId: id,
            notes: `Purchase order ${updatedOrder.orderNumber}`,
          },
        });
      }

      return updatedOrder;
    });
  }

  async cancel(id: number) {
    const order = await this.findOne(id);

    if (order.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel COMPLETED orders');
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const order = await this.findOne(id);

    if (order.status === 'COMPLETED') {
      throw new BadRequestException('Cannot delete COMPLETED orders');
    }

    return this.prisma.purchaseOrder.delete({
      where: { id },
    });
  }
}
