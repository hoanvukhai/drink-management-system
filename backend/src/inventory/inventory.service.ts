// =====================================================
// backend/src/inventory/inventory.service.ts - ENHANCED
// =====================================================

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // =====================================================
  // CRUD INGREDIENTS
  // =====================================================

  async getAllIngredients() {
    return this.prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { transactions: true, recipeItems: true },
        },
      },
    });
  }

  async createIngredient(data: {
    name: string;
    unit: string;
    minStock?: number;
  }) {
    return this.prisma.ingredient.create({
      data: {
        name: data.name,
        unit: data.unit,
        minStock: data.minStock || 0,
        currentStock: 0,
        costPrice: 0,
      },
    });
  }

  // =====================================================
  // NHẬP KHO
  // =====================================================

  async importStock(
    ingredientId: number,
    quantity: number,
    totalPrice: number,
    note?: string,
    userId?: number,
  ) {
    if (quantity <= 0) throw new BadRequestException('Số lượng phải > 0');
    if (totalPrice < 0) throw new BadRequestException('Giá tiền không hợp lệ');

    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) throw new BadRequestException('Nguyên liệu không tồn tại');

    // Giá vốn bình quân gia quyền
    const oldTotalValue = ingredient.currentStock * ingredient.costPrice;
    const newTotalValue = totalPrice;
    const newStock = ingredient.currentStock + quantity;

    const newCostPrice =
      newStock > 0 ? (oldTotalValue + newTotalValue) / newStock : 0;

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryTransaction.create({
        data: {
          ingredientId,
          change: quantity,
          price: totalPrice,
          type: 'IMPORT',
          note: note || `Nhập kho ${quantity} ${ingredient.unit}`,
          userId,
        },
      });

      return tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          currentStock: newStock,
          costPrice: newCostPrice,
        },
      });
    });
  }

  // =====================================================
  // TRỪ KHO TỰ ĐỘNG
  // =====================================================

  async deductStockOnOrderComplete(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                recipe: {
                  include: {
                    ingredients: {
                      include: { ingredient: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) throw new BadRequestException('Đơn hàng không tồn tại');

    const ingredientUsage = new Map<
      number,
      { quantity: number; name: string; unit: string }
    >();

    for (const item of order.items) {
      const recipe = item.product.recipe;
      if (!recipe) {
        console.warn(
          `⚠️ Sản phẩm "${item.product.name}" chưa có công thức. Bỏ qua.`,
        );
        continue;
      }

      for (const recipeIng of recipe.ingredients) {
        const totalNeeded = recipeIng.quantity * item.quantity;

        if (ingredientUsage.has(recipeIng.ingredientId)) {
          const existing = ingredientUsage.get(recipeIng.ingredientId)!;
          existing.quantity += totalNeeded;
        } else {
          ingredientUsage.set(recipeIng.ingredientId, {
            quantity: totalNeeded,
            name: recipeIng.ingredient.name,
            unit: recipeIng.ingredient.unit,
          });
        }
      }
    }

    // Kiểm tra tồn kho
    for (const [ingredientId, usage] of ingredientUsage) {
      const ingredient = await this.prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });

      if (!ingredient) {
        throw new BadRequestException(
          `Nguyên liệu ID ${ingredientId} không tồn tại`,
        );
      }

      if (ingredient.currentStock < usage.quantity) {
        throw new BadRequestException(
          `Không đủ ${usage.name}. Cần: ${usage.quantity} ${usage.unit}, Còn: ${ingredient.currentStock} ${usage.unit}`,
        );
      }
    }

    // Trừ kho
    return this.prisma.$transaction(async (tx) => {
      for (const [ingredientId, usage] of ingredientUsage) {
        await tx.inventoryTransaction.create({
          data: {
            ingredientId,
            change: -usage.quantity,
            price: 0,
            type: 'EXPORT_SALES',
            note: `Bán đơn ${order.orderNumber}`,
            userId: order.createdById,
          },
        });

        await tx.ingredient.update({
          where: { id: ingredientId },
          data: {
            currentStock: { decrement: usage.quantity },
          },
        });
      }

      return {
        success: true,
        deducted: Array.from(ingredientUsage.entries()),
      };
    });
  }

  // =====================================================
  // KIỂM KÊ
  // =====================================================

  async stocktake(
    ingredientId: number,
    actualStock: number,
    reason: string,
    userId?: number,
  ) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) throw new BadRequestException('Nguyên liệu không tồn tại');

    const difference = actualStock - ingredient.currentStock;

    if (difference === 0) {
      return { message: 'Tồn kho khớp với hệ thống', difference: 0 };
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryTransaction.create({
        data: {
          ingredientId,
          change: difference,
          price: 0,
          type: 'AUDIT',
          note: `Kiểm kê: ${reason}. Chênh lệch: ${difference > 0 ? '+' : ''}${difference} ${ingredient.unit}`,
          userId,
        },
      });

      return tx.ingredient.update({
        where: { id: ingredientId },
        data: { currentStock: actualStock },
      });
    });
  }

  // =====================================================
  // BÁO HỎA / HỎNG HÀNG
  // =====================================================

  async reportDamage(
    ingredientId: number,
    quantity: number,
    reason: string,
    userId?: number,
  ) {
    if (quantity <= 0) throw new BadRequestException('Số lượng phải > 0');

    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) throw new BadRequestException('Nguyên liệu không tồn tại');

    if (ingredient.currentStock < quantity) {
      throw new BadRequestException(
        `Không đủ hàng để báo hỏng. Còn: ${ingredient.currentStock} ${ingredient.unit}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.inventoryTransaction.create({
        data: {
          ingredientId,
          change: -quantity,
          price: 0,
          type: 'EXPORT_DAMAGE',
          note: `Báo hỏng: ${reason}`,
          userId,
        },
      });

      return tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          currentStock: { decrement: quantity },
        },
      });
    });
  }

  // =====================================================
  // REPORTS
  // =====================================================

  async getInventoryReport() {
    const ingredients = await this.prisma.ingredient.findMany({
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      unit: ing.unit,
      currentStock: ing.currentStock,
      costPrice: ing.costPrice,
      minStock: ing.minStock,
      status:
        ing.currentStock <= ing.minStock
          ? 'LOW_STOCK'
          : ing.currentStock === 0
            ? 'OUT_OF_STOCK'
            : 'OK',
      totalValue: ing.currentStock * ing.costPrice,
      recentTransactions: ing.transactions,
    }));
  }

  async calculateCOGS(startDate: Date, endDate: Date) {
    const salesTransactions = await this.prisma.inventoryTransaction.findMany({
      where: {
        type: 'EXPORT_SALES',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        ingredient: true,
      },
    });

    let totalCOGS = 0;
    const breakdown = salesTransactions.map((tx) => {
      const cost = Math.abs(tx.change) * tx.ingredient.costPrice;
      totalCOGS += cost;
      return {
        ingredient: tx.ingredient.name,
        quantity: Math.abs(tx.change),
        unit: tx.ingredient.unit,
        costPrice: tx.ingredient.costPrice,
        totalCost: cost,
        date: tx.createdAt,
      };
    });

    return {
      totalCOGS,
      startDate,
      endDate,
      breakdown,
    };
  }

  async getTransactions(filters: {
    ingredientId?: number;
    type?: TransactionType;
    limit?: number;
  }) {
    return this.prisma.inventoryTransaction.findMany({
      where: {
        ingredientId: filters.ingredientId,
        type: filters.type,
      },
      include: {
        ingredient: {
          select: { name: true, unit: true },
        },
        createdBy: {
          select: { name: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
    });
  }
}
