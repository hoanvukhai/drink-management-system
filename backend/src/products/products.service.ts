// src/product/product.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Đảm bảo bạn đã import PrismaService
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto'; // Import DTO mới

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({ data: createProductDto });
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  // --- THÊM PHƯƠNG THỨC MỚI ---
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  // --- THÊM PHƯƠNG THỨC MỚI ---
  async update(id: number, updateProductDto: UpdateProductDto) {
    // Thử tìm sản phẩm trước để đảm bảo nó tồn tại
    await this.findOne(id);
    // Nếu tồn tại, tiến hành cập nhật
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    // 1. Chúng ta dùng lại hàm findOne để kiểm tra xem sản phẩm có tồn tại không
    // Hàm findOne sẽ tự động ném lỗi NotFoundException nếu không tìm thấy
    await this.findOne(id);
    // 2. Nếu tìm thấy, tiến hành xóa
    return this.prisma.product.delete({
      where: { id },
    });
  }
}