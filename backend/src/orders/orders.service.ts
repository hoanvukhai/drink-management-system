import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items } = createOrderDto;

    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    let totalAmount = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        totalAmount += product.price * item.quantity;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          totalAmount: totalAmount,
        },
      });

      const orderItemsData = items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
      }));

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      return order;
    });
  }

  findAll() {
    // Đây là truy vấn quan trọng nhất
    return this.prisma.order.findMany({
      // Sắp xếp các đơn hàng mới nhất lên đầu
      orderBy: {
        createdAt: 'desc',
      },
      // "include" có nghĩa là "lấy kèm theo"
      include: {
        // "items" là tên quan hệ trong schema.prisma của bạn
        items: {
          include: {
            // "product" là tên quan hệ trong schema.prisma
            product: true, // Lấy luôn thông tin sản phẩm (tên, giá...)
          },
        },
      },
    });
  }
}