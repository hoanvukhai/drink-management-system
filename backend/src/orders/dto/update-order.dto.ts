import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

export type EditAction = 'DELETE' | 'UPDATE_QUANTITY' | 'UPDATE_NOTE';

export class EditOrderItemDto {
  @IsString()
  action: EditAction;

  @IsInt()
  @Min(1)
  @IsOptional()
  newQuantity?: number;

  @IsString()
  @IsOptional()
  newNote?: string;

  @IsString()
  reason: string; // BẮT BUỘC!

  @IsInt()
  @IsOptional()
  userId?: number;
}
