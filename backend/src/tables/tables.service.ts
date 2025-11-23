import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async create(createTableDto: CreateTableDto) {
    // Kiểm tra zone tồn tại
    const zone = await this.prisma.zone.findUnique({
      where: { id: createTableDto.zoneId },
    });

    if (!zone) {
      throw new NotFoundException(`Zone #${createTableDto.zoneId} not found`);
    }

    return this.prisma.table.create({
      data: {
        name: createTableDto.name,
        zoneId: createTableDto.zoneId,
        status: 'AVAILABLE',
      },
      include: { zone: true },
    });
  }

  findAll() {
    return this.prisma.table.findMany({
      include: { zone: true },
      orderBy: [{ zoneId: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: number) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        zone: true,
        orders: {
          where: {
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
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
    const validStatuses = ['AVAILABLE', 'OCCUPIED'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status: ${status}. Must be AVAILABLE or OCCUPIED`,
      );
    }

    // Kiểm tra table tồn tại
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table #${id} not found`);
    }

    return this.prisma.table.update({
      where: { id },
      data: { status },
      include: { zone: true },
    });
  }

  async remove(id: number) {
    // ✅ PHẢI CÓ include để lấy orders
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: {
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundException(`Table #${id} not found`);
    }

    // ✅ Bây giờ TypeScript biết table.orders tồn tại
    if (table.orders.length > 0) {
      throw new BadRequestException('Cannot delete table with active orders');
    }

    return this.prisma.table.delete({ where: { id } });
  }
}
