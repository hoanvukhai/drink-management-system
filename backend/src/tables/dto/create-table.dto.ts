import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  zoneId: number; // Bắt buộc phải chọn khu vực
}
