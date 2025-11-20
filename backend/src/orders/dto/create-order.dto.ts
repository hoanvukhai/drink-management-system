// src/orders/dto/create-order.dto.ts

// --- ĐẢM BẢO BẠN CÓ ĐỦ 2 DÒNG IMPORT NÀY ---
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  ValidateNested,
} from 'class-validator';
// ---

// Định nghĩa cho 1 món hàng bên trong
class OrderItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsPositive() // Số lượng phải > 0
  quantity: number;
}

// Đây là DTO chính
export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true }) // Kiểm tra từng phần tử trong mảng
  @Type(() => OrderItemDto) // Giúp class-validator biết mảng này chứa gì
  items: OrderItemDto[];
}