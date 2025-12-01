import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsNotEmpty()
  baseUnit: string; // ml, g, cái, lon

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentStock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minStock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxStock?: number;

  @IsBoolean()
  @IsOptional()
  hasExpiry?: boolean;

  @IsNumber()
  @IsOptional()
  expiryDays?: number;
}
