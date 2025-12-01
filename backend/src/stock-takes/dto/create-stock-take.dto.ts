import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StockTakeItemDto {
  @IsNumber()
  itemId: number;

  @IsNumber()
  actualQty: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateStockTakeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  createdById: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTakeItemDto)
  items: StockTakeItemDto[];
}
