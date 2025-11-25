import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TableStatus } from '@prisma/client'; // 👈 Import TableStatus enum

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async create(createTableDto: CreateTableDto) {
    const zone = await this.prisma.zone.findUnique({
      where: { id: createTableDto.zoneId },
    });

    if (!zone) {
      throw new NotFoundException(`Zone #${createTableDto.zoneId} not found`);
    }

    return this.prisma.table.create({
      data: {
        name: createTableDto.name,
        capacity: 4, // Default capacity
        zoneId: createTableDto.zoneId,
        status: TableStatus.AVAILABLE, // 👈 Dùng enum
      },
      include: { zone: true },
    });
  }

  findAll() {
    return this.prisma.table.findMany({
      include: {
        zone: true,
        // Lấy đơn hàng đang PENDING của bàn này
        orders: {
          where: { status: { not: 'COMPLETED' } }, // 👈 Lấy tất cả orders chưa hoàn thành
          include: {
            items: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ zoneId: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: number) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        zone: true,
        orders: {
          where: { status: { not: 'COMPLETED' } },
          include: {
            items: { include: { product: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!table) {
      throw new NotFoundException(`Table #${id} not found`);
    }

    return table;
  }

  async updateStatus(id: number, status: string) {
    // 👇 Validate status trước
    const validStatuses: TableStatus[] = [
      TableStatus.AVAILABLE,
      TableStatus.OCCUPIED,
    ];

    if (!validStatuses.includes(status as TableStatus)) {
      throw new BadRequestException(
        `Invalid status: ${status}. Must be AVAILABLE or OCCUPIED`,
      );
    }

    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table #${id} not found`);
    }

    return this.prisma.table.update({
      where: { id },
      data: { status: status as TableStatus }, // 👈 Cast về TableStatus
      include: { zone: true },
    });
  }

  async remove(id: number) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: { status: { not: 'COMPLETED' } },
        },
      },
    });

    if (!table) {
      throw new NotFoundException(`Table #${id} not found`);
    }

    if (table.orders && table.orders.length > 0) {
      throw new BadRequestException('Cannot delete table with active orders');
    }

    return this.prisma.table.delete({ where: { id } });
  }
}
