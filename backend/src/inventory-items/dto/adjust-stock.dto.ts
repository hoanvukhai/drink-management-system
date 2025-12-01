import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

export enum AdjustmentType {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
  SET = 'SET',
}

export class AdjustStockDto {
  @IsEnum(AdjustmentType)
  type: AdjustmentType;

  @IsNumber()
  quantity: number;

  @IsString()
  reason: string;

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
