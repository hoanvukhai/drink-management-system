import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { ShiftStatus } from '@prisma/client';

export class QueryShiftsDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;
}
