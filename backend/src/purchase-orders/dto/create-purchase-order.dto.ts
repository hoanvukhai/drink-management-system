import {
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderItemDto {
  @IsNumber()
  itemId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  batchNumber?: string;
}

export class CreatePurchaseOrderDto {
  @IsNumber()
  @IsOptional()
  supplierId?: number;

  @IsNumber()
  createdById: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
