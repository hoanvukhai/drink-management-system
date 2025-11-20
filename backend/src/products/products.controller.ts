// src/product/product.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch, // Import 'Patch'
  Param, // Import 'Param'
  Delete,
  ParseIntPipe, // Import 'ParseIntPipe' để chuyển id thành số
  // NotFoundException,
} from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto'; // Import DTO mới

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  // --- THÊM ENDPOINT MỚI ---
  // API này để lấy dữ liệu cho form sửa
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // 'ParseIntPipe' tự động chuyển 'id' từ string (URL) sang number
    return this.productService.findOne(id);
  }

  // --- THÊM ENDPOINT MỚI ---
  // API này để nhận dữ liệu từ form sửa và cập nhật
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // 'ParseIntPipe' cũng chuyển id sang số
    return this.productService.remove(id);
  }
}