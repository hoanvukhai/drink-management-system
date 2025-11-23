import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items, tableId } = createOrderDto;

    // 1. Lấy thông tin sản phẩm để tính giá
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // 2. Tính tổng tiền
    let totalAmount = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        totalAmount += product.price * item.quantity;
      }
    }

    // 3. Tạo order với transaction
    return this.prisma.$transaction(async (tx) => {
      // Tạo order
      const order = await tx.order.create({
        data: {
          totalAmount,
          status: 'PENDING',
          tableId: tableId || null, // null = mang về
        },
      });

      // Tạo order items với note
      const orderItemsData = items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        note: item.note || null,
      }));

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // 4. Cập nhật trạng thái bàn -> OCCUPIED (nếu có tableId)
      if (tableId) {
        await tx.table.update({
          where: { id: tableId },
          data: { status: 'OCCUPIED' },
        });
      }

      // Return order với đầy đủ thông tin
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          table: true,
          items: {
            include: { product: true },
          },
        },
      });
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        table: true, // 👈 Lấy kèm thông tin bàn
        items: {
          include: { product: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return order;
  }

  // 👇 Cập nhật trạng thái order
  async updateStatus(id: number, status: string) {
    // Kiểm tra order tồn tại
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { table: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    // Cập nhật status
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        table: true,
        items: {
          include: { product: true },
        },
      },
    });

    // Nếu order COMPLETED/CANCELLED và có bàn -> Kiểm tra xem bàn còn order nào không
    if (['COMPLETED', 'CANCELLED'].includes(status) && order.tableId) {
      const pendingOrders = await this.prisma.order.count({
        where: {
          tableId: order.tableId,
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
        },
      });

      // Nếu không còn order nào -> Chuyển bàn về AVAILABLE
      if (pendingOrders === 0) {
        await this.prisma.table.update({
          where: { id: order.tableId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    return updatedOrder;
  }
}
