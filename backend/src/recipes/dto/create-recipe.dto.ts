import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeIngredientDto {
  @IsString()
  name: string;

  @IsString()
  quantity: string;

  @IsString()
  @IsOptional()
  note?: string;
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
