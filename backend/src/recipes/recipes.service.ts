import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  // Lấy công thức theo productId
  async getByProduct(productId: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { productId },
      include: {
        ingredients: { orderBy: { id: 'asc' } },
        steps: { orderBy: { stepNumber: 'asc' } },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException(
        `Chưa có công thức cho sản phẩm #${productId}`,
      );
    }

    return recipe;
  }

  // --- FIND ALL ---
  findAll() {
    return this.prisma.recipe.findMany({
      include: {
        product: { select: { id: true, name: true } },
        ingredients: { include: { ingredient: true } }, // Kèm tên nguyên liệu
      },
    });
  }

  // --- CREATE ---
  async create(createRecipeDto: CreateRecipeDto) {
    const { productId, description, ingredients, steps } = createRecipeDto;

    // 1. Check Product
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product)
      throw new NotFoundException(`Sản phẩm #${productId} không tồn tại`);

    // 2. Check Existing Recipe
    const existing = await this.prisma.recipe.findUnique({
      where: { productId },
    });
    if (existing) throw new ConflictException(`Sản phẩm này đã có công thức.`);

    // 3. Tạo Recipe
    return this.prisma.recipe.create({
      data: {
        productId,
        description,
        ingredients: {
          create: ingredients.map((i) => ({
            ingredientId: i.ingredientId, // Link với bảng Ingredient
            quantity: i.quantity,
          })),
        },
        steps: {
          create: steps.map((s) => ({
            stepNumber: s.stepNumber,
            instruction: s.instruction,
          })),
        },
      },
      include: {
        ingredients: { include: { ingredient: true } }, // Kèm tên nguyên liệu
        steps: true,
      },
    });
  }

  // Cập nhật công thức
  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });
    if (!recipe) throw new NotFoundException(`Công thức #${id} không tồn tại`);

    return this.prisma.$transaction(async (tx) => {
      // 1. Xóa hết nguyên liệu và các bước cũ
      await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      await tx.recipeStep.deleteMany({ where: { recipeId: id } });

      // 2. Cập nhật thông tin và tạo lại danh sách mới
      return tx.recipe.update({
        where: { id },
        data: {
          description: updateRecipeDto.description,

          // SỬA Ở ĐÂY: Dùng 'create' và 'map' để an toàn dữ liệu đầu vào (giống hàm create)
          ingredients: {
            create:
              updateRecipeDto.ingredients?.map((i) => ({
                ingredientId: i.ingredientId,
                quantity: i.quantity,
              })) || [],
          },

          steps: {
            create:
              updateRecipeDto.steps?.map((s) => ({
                stepNumber: s.stepNumber,
                instruction: s.instruction,
              })) || [],
          },
        },
        include: {
          ingredients: {
            include: { ingredient: true },
            orderBy: { id: 'asc' },
          }, // Kèm tên nguyên liệu
          steps: { orderBy: { stepNumber: 'asc' } },
          product: { select: { id: true, name: true } },
        },
      });
    });
  }

  async remove(id: number) {
    return this.prisma.recipe.delete({ where: { id } });
  }

  // Kiểm tra xem product đã có recipe chưa
  async hasRecipe(productId: number): Promise<boolean> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { productId },
      select: { id: true },
    });
    return !!recipe;
  }
}
