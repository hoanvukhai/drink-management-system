import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateIngredientDto,
  InventoryTransactionDto,
} from './dto/create-ingredient.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  // 1. Tạo nguyên liệu mới
  create(dto: CreateIngredientDto) {
    return this.prisma.ingredient.create({
      data: {
        name: dto.name,
        unit: dto.unit,
        minStock: dto.minStock || 0,
        currentStock: 0,
        costPrice: 0,
      },
    });
  }

  // 2. Lấy danh sách kho
  findAll() {
    return this.prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // 3. Xử lý Giao dịch Kho (Gộp cả Nhập hàng & Kiểm kê vào đây)
  async handleTransaction(
    id: number,
    dto: InventoryTransactionDto,
    userId: number,
  ) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    });
    if (!ingredient) throw new NotFoundException('Nguyên liệu không tồn tại');

    // Logic tính giá vốn mới (Chỉ khi NHẬP HÀNG)
    let newCostPrice = ingredient.costPrice;

    if (dto.type === 'IMPORT') {
      if (!dto.price)
        throw new BadRequestException('Nhập hàng phải có giá tiền (price)');

      const oldTotalValue = ingredient.currentStock * ingredient.costPrice;
      const newTotalValue = dto.price;
      const newStock = ingredient.currentStock + dto.change;

      if (newStock > 0) {
        newCostPrice = (oldTotalValue + newTotalValue) / newStock;
      }
    }

    // Thực hiện Transaction
    return this.prisma.$transaction(async (tx) => {
      // A. Ghi lịch sử
      await tx.inventoryTransaction.create({
        data: {
          ingredientId: id,
          change: dto.change,
          price: dto.price || 0,
          type: dto.type,
          note: dto.note,
          userId: userId,
        },
      });

      // B. Cập nhật kho
      return tx.ingredient.update({
        where: { id },
        data: {
          currentStock: { increment: dto.change }, // Cộng hoặc trừ
          costPrice: newCostPrice,
        },
      });
    });
  }
}
