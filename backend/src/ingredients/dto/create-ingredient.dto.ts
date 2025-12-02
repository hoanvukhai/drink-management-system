import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  //   IsEnum,
} from 'class-validator';

// 1. DTO Tạo Nguyên liệu mới
export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string; // VD: "Sữa đặc"

  @IsString()
  @IsNotEmpty()
  unit: string; // VD: "Lon"

  @IsNumber()
  @IsOptional()
  minStock?: number; // Cảnh báo khi dưới mức này
}

// 2. DTO Giao dịch kho (Dùng chung cho Nhập hàng, Kiểm kê, Hủy)
export class InventoryTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  change: number; // Số lượng thay đổi (VD: +10 hoặc -5)

  @IsString()
  @IsNotEmpty()
  type: 'IMPORT' | 'EXPORT_DAMAGE' | 'AUDIT'; // Loại giao dịch

  @IsNumber()
  @IsOptional()
  price?: number; // Tổng tiền (Chỉ bắt buộc khi type = IMPORT)

  @IsString()
  @IsOptional()
  note?: string; // Ghi chú (VD: "Nhập hàng Vinamilk")
}
