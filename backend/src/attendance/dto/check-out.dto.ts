import { IsString, IsOptional } from 'class-validator';

export class CheckOutDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
