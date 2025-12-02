import {
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeIngredientDto {
  @IsInt()
  ingredientId: number; // <-- Sửa: Dùng ID nguyên liệu, không dùng tên

  @IsNumber()
  @Min(0)
  quantity: number; // <-- Sửa: Dùng số (Float) để trừ kho
}

export class RecipeStepDto {
  @IsInt()
  stepNumber: number;

  @IsString()
  instruction: string;
}

export class CreateRecipeDto {
  @IsInt()
  productId: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeStepDto)
  steps: RecipeStepDto[];
}
