import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ShiftStatus } from '@prisma/client';

export class CreateShiftDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  shiftName: string; // "Ca sáng", "Ca chiều", "Ca tối"

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsEnum(ShiftStatus)
  @IsOptional()
  status?: ShiftStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
