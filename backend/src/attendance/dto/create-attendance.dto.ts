import { IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @IsNumber()
  userId: number;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  @IsOptional()
  checkOut?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
