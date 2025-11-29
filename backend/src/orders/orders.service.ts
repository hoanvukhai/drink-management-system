import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto, AddItemsDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, TableStatus } from '@prisma/client'; // 👈 Import enums
import { EditOrderItemDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // 1. TẠO ĐƠN MỚI
  // ============================================
  async create(createOrderDto: CreateOrderDto) {
    const { items, tableId, customerName, customerPhone, type } =
      createOrderDto;

    // Kiểm tra bàn nếu DINE_IN
    if (type === 'DINE_IN' && tableId) {
      const table = await this.prisma.table.findUnique({
        where: { id: tableId },
      });
      if (!table) {
        throw new NotFoundException(`Table #${tableId} not found`);
      }
    }

    // Lấy sản phẩm
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Tính tổng tiền
    let totalAmount = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        totalAmount += product.price * item.quantity;
      }
    }

    // Generate order number
    const orderCount = await this.prisma.order.count();
    const orderNumber = `#${String(orderCount + 1).padStart(4, '0')}`;

    return this.prisma.$transaction(async (tx) => {
      // Tạo order
      const order = await tx.order.create({
        data: {
          orderNumber,
          totalAmount,
          status: OrderStatus.PENDING, // 👈 Dùng enum
          type: type || (tableId ? 'DINE_IN' : 'TAKEAWAY'),
          tableId: tableId || null,
          customerName,
          customerPhone,
        },
      });

      // Tạo items
      const orderItemsData = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product?.price || 0,
          note: item.note || null,
          isServed: false,
        };
      });

      await tx.orderItem.createMany({ data: orderItemsData });

      // Cập nhật bàn
      if (tableId) {
        await tx.table.update({
          where: { id: tableId },
          data: { status: TableStatus.OCCUPIED }, // 👈 Dùng enum
        });
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          table: { include: { zone: true } },
          items: { include: { product: true }, orderBy: { createdAt: 'asc' } },
        },
      });
    });
  }

  // ============================================
  // 2. GỌI THÊM MÓN
  // ============================================
  async addItems(orderId: number, addItemsDto: AddItemsDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    if (order.status === OrderStatus.COMPLETED) {
      // 👈 Dùng enum
      throw new BadRequestException('Cannot add items to completed order');
    }

    const { items } = addItemsDto;
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    return this.prisma.$transaction(async (tx) => {
      const newItemsData = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          orderId: orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: product?.price || 0,
          note: item.note || null,
          isServed: false,
        };
      });

      await tx.orderItem.createMany({ data: newItemsData });

      const allItems = await tx.orderItem.findMany({ where: { orderId } });
      const newTotal = allItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      await tx.order.update({
        where: { id: orderId },
        data: { totalAmount: newTotal },
      });

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          table: { include: { zone: true } },
          items: { include: { product: true }, orderBy: { createdAt: 'asc' } },
        },
      });
    });
  }

  // ============================================
  // 3. XÓA MÓN
  // ============================================
  async removeItem(orderId: number, itemId: number) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true },
    });

    if (!item || item.orderId !== orderId) {
      throw new NotFoundException('Order item not found');
    }

    if (item.isServed) {
      throw new BadRequestException('Cannot delete item that has been served');
    }

    await this.prisma.orderItem.delete({ where: { id: itemId } });

    const remainingItems = await this.prisma.orderItem.findMany({
      where: { orderId },
    });
    const newTotal = remainingItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return this.prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: newTotal },
      include: {
        table: { include: { zone: true } },
        items: { include: { product: true } },
      },
    });
  }

  // ============================================
  // 4. PHA CHẾ XONG
  // ============================================
  async markAsReady(orderId: number) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.READY, // 👈 Dùng enum
        readyAt: new Date(),
      },
      include: {
        table: { include: { zone: true } },
        items: { include: { product: true } },
      },
    });
  }

  // ============================================
  // 5. ĐÁNH DẤU MÓN ĐÃ MANG RA
  // ============================================
  async markItemServed(orderId: number, itemId: number) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.orderId !== orderId) {
      throw new NotFoundException('Order item not found');
    }

    await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { isServed: true },
    });

    // Kiểm tra tất cả món đã mang ra chưa
    const allItems = await this.prisma.orderItem.findMany({
      where: { orderId },
    });

    const allServed = allItems.every((item) => item.isServed);

    if (allServed) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.SERVED, // 👈 Dùng enum
          servedAt: new Date(),
        },
      });
    }

    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: { include: { zone: true } },
        items: { include: { product: true } },
      },
    });
  }

  // ============================================
  // 6. CHUYỂN BÀN
  // ============================================
  async moveTable(orderId: number, newTableId: number) {
    const [order, newTable] = await Promise.all([
      this.prisma.order.findUnique({ where: { id: orderId } }),
      this.prisma.table.findUnique({ where: { id: newTableId } }),
    ]);

    if (!order) throw new NotFoundException(`Order not found`);
    if (!newTable) throw new NotFoundException(`Table not found`);
    if (newTable.status === TableStatus.OCCUPIED) {
      // 👈 Dùng enum
      throw new BadRequestException('Target table is occupied');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { tableId: newTableId },
      });

      // Trả bàn cũ
      if (order.tableId) {
        const remaining = await tx.order.count({
          where: {
            tableId: order.tableId,
            status: { not: OrderStatus.COMPLETED }, // 👈 Dùng enum
            id: { not: orderId },
          },
        });

        if (remaining === 0) {
          await tx.table.update({
            where: { id: order.tableId },
            data: { status: TableStatus.AVAILABLE }, // 👈 Dùng enum
          });
        }
      }

      // Cập nhật bàn mới
      await tx.table.update({
        where: { id: newTableId },
        data: { status: TableStatus.OCCUPIED }, // 👈 Dùng enum
      });

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          table: { include: { zone: true } },
          items: { include: { product: true } },
        },
      });
    });
  }

  // ============================================
  // 7. THANH TOÁN
  // ============================================
  async complete(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException(`Order not found`);

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COMPLETED, // 👈 Dùng enum
          completedAt: new Date(),
        },
      });

      // Trả bàn
      if (order.tableId) {
        const remaining = await tx.order.count({
          where: {
            tableId: order.tableId,
            status: { not: OrderStatus.COMPLETED }, // 👈 Dùng enum
            id: { not: orderId },
          },
        });

        if (remaining === 0) {
          await tx.table.update({
            where: { id: order.tableId },
            data: { status: TableStatus.AVAILABLE }, // 👈 Dùng enum
          });
        }
      }

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          table: { include: { zone: true } },
          items: { include: { product: true } },
        },
      });
    });
  }

  // ============================================
  // 8. LẤY DANH SÁCH
  // ============================================

  findForServer() {
    return this.prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.READY, OrderStatus.SERVED], // 👈 Dùng enum
        },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        table: { include: { zone: true } },
        items: { include: { product: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  findForKitchen() {
    return this.prisma.order.findMany({
      where: { status: OrderStatus.PENDING }, // 👈 Dùng enum
      orderBy: { createdAt: 'asc' },
      include: {
        table: { include: { zone: true } },
        items: { include: { product: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  findForCashier() {
    return this.prisma.order.findMany({
      where: { status: OrderStatus.SERVED }, // 👈 Dùng enum
      orderBy: { createdAt: 'asc' },
      include: {
        table: { include: { zone: true } },
        items: { include: { product: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async getActiveOrderByTable(tableId: number) {
    return this.prisma.order.findFirst({
      where: {
        tableId,
        status: { not: OrderStatus.COMPLETED }, // 👈 Dùng enum
      },
      include: {
        table: { include: { zone: true } },
        items: { include: { product: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        table: { include: { zone: true } },
        items: { include: { product: true } },
      },
    });
  }

  async editItem(orderId: number, itemId: number, dto: EditOrderItemDto) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true, product: true },
    });

    if (!item || item.orderId !== orderId) {
      throw new NotFoundException('Order item not found');
    }

    // Không cho sửa món đã mang ra
    if (item.isServed) {
      throw new BadRequestException('Cannot edit served item');
    }

    // Lưu giá trị cũ
    const oldValue = JSON.stringify({
      quantity: item.quantity,
      note: item.note,
    });

    return this.prisma.$transaction(async (tx) => {
      let newValue: string | null = null;

      if (dto.action === 'DELETE') {
        // Xóa món
        await tx.orderItem.delete({ where: { id: itemId } });
        newValue = null;
      } else if (dto.action === 'UPDATE_QUANTITY' && dto.newQuantity) {
        const updatedItem = await tx.orderItem.update({
          where: { id: itemId },
          data: { quantity: dto.newQuantity },
        });
        newValue = JSON.stringify({
          quantity: updatedItem.quantity,
          note: updatedItem.note,
        });
      } else if (dto.action === 'UPDATE_NOTE') {
        const updatedItem = await tx.orderItem.update({
          where: { id: itemId },
          data: { note: dto.newNote || null },
        });
        newValue = JSON.stringify({
          quantity: updatedItem.quantity,
          note: updatedItem.note,
        });
      }

      // Lưu log chỉnh sửa
      await tx.orderItemEdit.create({
        data: {
          orderItemId: itemId,
          action: dto.action,
          oldValue,
          newValue,
          reason: dto.reason,
          userId: dto.userId,
        },
      });

      // Cập nhật tổng tiền
      const allItems = await tx.orderItem.findMany({ where: { orderId } });
      const newTotal = allItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );

      await tx.order.update({
        where: { id: orderId },
        data: { totalAmount: newTotal },
      });

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: true } },
          table: { include: { zone: true } },
        },
      });
    });
  }

  async markItemCompleted(orderId: number, itemId: number) {
    return this.prisma.orderItem.update({
      where: { id: itemId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  async getEditHistory(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            edits: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    // Tổng hợp tất cả edits
    const allEdits = order.items.flatMap((item) =>
      item.edits.map((edit) => ({
        ...edit,
        itemId: item.id,
        itemName: item.product.name,
        itemPrice: item.price,
      })),
    );

    return allEdits.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
