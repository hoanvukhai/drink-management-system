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

// 🔥 FIX: Sử dụng ingredientId thay vì name
export class RecipeIngredientDto {
  @IsInt()
  ingredientId: number; // ID của nguyên liệu trong bảng Ingredient

  @IsNumber()
  @Min(0)
  quantity: number; // Định lượng (VD: 0.03 kg)
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
