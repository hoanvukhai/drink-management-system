import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  type: string; // 'UTILITY', 'SALARY', 'MARKETING', 'OTHER'

  @IsString()
  @IsOptional()
  note?: string;
}
