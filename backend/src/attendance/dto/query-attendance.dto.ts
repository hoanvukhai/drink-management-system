import { IsOptional, IsString, IsNumber } from 'class-validator';

export class QueryAttendanceDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
