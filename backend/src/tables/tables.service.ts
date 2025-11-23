import { Injectable } from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  create(createTableDto: CreateTableDto) {
    return this.prisma.table.create({
      data: {
        name: createTableDto.name,
        zoneId: createTableDto.zoneId,
        status: 'AVAILABLE', // Mặc định là trống
      },
    });
  }

  findAll() {
    return this.prisma.table.findMany({
      include: { zone: true }, // Lấy kèm thông tin khu vực
    });
  }
  // API để update trạng thái (sẽ dùng sau này khi đặt món)
  updateStatus(id: number, status: string) {
    return this.prisma.table.update({
      where: { id },
      data: { status },
    });
  }

  remove(id: number) {
    return this.prisma.table.delete({ where: { id } });
  }
}
