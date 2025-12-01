import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export enum ConsumptionReason {
  SALE = 'SALE', // Bán hàng
  WASTE = 'WASTE', // Hao hụt
  DAMAGED = 'DAMAGED', // Hư hỏng
  EXPIRED = 'EXPIRED', // Hết hạn
  OTHER = 'OTHER', // Khác
}

export class CreateConsumptionTrackingDto {
  @IsNumber()
  itemId: number;

  @IsNumber()
  @IsOptional()
  orderId?: number;

  @IsNumber()
  @IsOptional()
  productId?: number;

  @IsString()
  @IsOptional()
  productName?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsEnum(ConsumptionReason)
  reason: ConsumptionReason;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  unitCost?: number;

  @IsNumber()
  @IsOptional()
  totalCost?: number;

  @IsNumber()
  @IsOptional()
  userId?: number;
}
