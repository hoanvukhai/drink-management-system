import { Injectable } from '@nestjs/common';
import { CreateZoneDto } from './dto/create-zone.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ZonesService {
  constructor(private prisma: PrismaService) {}

  create(createZoneDto: CreateZoneDto) {
    return this.prisma.zone.create({
      data: createZoneDto,
    });
  }

  findAll() {
    // Lấy danh sách khu vực kèm luôn các bàn bên trong
    // Để frontend vẽ: Tầng 1 -> [Bàn 1, Bàn 2...]
    return this.prisma.zone.findMany({
      include: {
        tables: {
          orderBy: { id: 'asc' }, // Sắp xếp bàn theo thứ tự
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  remove(id: number) {
    return this.prisma.zone.delete({ where: { id } });
  }
}
