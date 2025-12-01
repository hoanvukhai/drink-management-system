import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CheckInDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
