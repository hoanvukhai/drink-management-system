import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInventoryCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
