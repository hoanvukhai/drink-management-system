import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConsumptionTrackingDto } from './dto/create-consumption-tracking.dto';
import { UpdateConsumptionTrackingDto } from './dto/update-consumption-tracking.dto';
import { QueryConsumptionDto } from './dto/query-consumption.dto';
import { Prisma } from '@prisma/client';

interface ConsumptionGroupedItem {
  itemId: number; // hoặc string tùy DB
  itemName: string;
  unit: string;
  totalQuantity: number;
  totalCost: number;
  byReason: Record<string, { quantity: number; cost: number }>;
}

interface ConsumptionGroupedByReason {
  reason: string;
  totalCost: number;
  count: number;
}

@Injectable()
export class ConsumptionTrackingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateConsumptionTrackingDto) {
    // Get item info if not provided
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: dto.itemId },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item #${dto.itemId} not found`);
    }

    // Calculate cost if not provided
    const unitCost = dto.unitCost ?? item.averageCost ?? 0;
    const totalCost = dto.totalCost ?? unitCost * dto.quantity;

    return this.prisma.consumptionTracking.create({
      data: {
        ...dto,
        unitCost,
        totalCost,
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            baseUnit: true,
          },
        },
      },
    });
  }

  findAll(query?: QueryConsumptionDto) {
    const where: Prisma.ConsumptionTrackingWhereInput = {};

    if (query?.reason) {
      where.reason = query.reason;
    }

    if (query?.startDate || query?.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    return this.prisma.consumptionTracking.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            baseUnit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.consumptionTracking.findUnique({
      where: { id },
      include: {
        item: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Consumption tracking #${id} not found`);
    }

    return record;
  }

  async update(id: number, dto: UpdateConsumptionTrackingDto) {
    await this.findOne(id);
    return this.prisma.consumptionTracking.update({
      where: { id },
      data: dto,
      include: {
        item: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.consumptionTracking.delete({
      where: { id },
    });
  }

  // Report: Consumption by item
  async getConsumptionByItem(startDate?: string, endDate?: string) {
    const where: Prisma.ConsumptionTrackingWhereInput = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const consumptions = await this.prisma.consumptionTracking.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            baseUnit: true,
          },
        },
      },
    });

    // Group by item
    const grouped = consumptions.reduce(
      (acc, c) => {
        const itemId = c.itemId;
        if (!acc[itemId]) {
          acc[itemId] = {
            itemId,
            itemName: c.item.name,
            unit: c.item.baseUnit,
            totalQuantity: 0,
            totalCost: 0,
            byReason: {},
          };
        }

        acc[itemId].totalQuantity += c.quantity;
        acc[itemId].totalCost += c.totalCost || 0;

        if (!acc[itemId].byReason[c.reason]) {
          acc[itemId].byReason[c.reason] = {
            quantity: 0,
            cost: 0,
          };
        }

        acc[itemId].byReason[c.reason].quantity += c.quantity;
        acc[itemId].byReason[c.reason].cost += c.totalCost || 0;

        return acc;
      },
      {} as Record<number, ConsumptionGroupedItem>,
    );

    return Object.values(grouped);
  }

  // Report: Consumption by reason
  async getConsumptionByReason(startDate?: string, endDate?: string) {
    const where: Prisma.ConsumptionTrackingWhereInput = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const consumptions = await this.prisma.consumptionTracking.findMany({
      where,
    });

    // Group by reason
    const grouped = consumptions.reduce(
      (acc, c) => {
        const reason = c.reason;
        if (!acc[reason]) {
          acc[reason] = {
            reason,
            totalCost: 0,
            count: 0,
          };
        }

        acc[reason].totalCost += c.totalCost || 0;
        acc[reason].count += 1;

        return acc;
      },
      {} as Record<string, ConsumptionGroupedByReason>,
    );

    return Object.values(grouped);
  }
}
