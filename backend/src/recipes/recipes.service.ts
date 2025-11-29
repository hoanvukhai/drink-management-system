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

  // Lấy tất cả công thức
  async findAll() {
    return this.prisma.recipe.findMany({
      include: {
        ingredients: { orderBy: { id: 'asc' } },
        steps: { orderBy: { stepNumber: 'asc' } },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Tạo công thức mới
  async create(createRecipeDto: CreateRecipeDto) {
    // Kiểm tra product có tồn tại không
    const product = await this.prisma.product.findUnique({
      where: { id: createRecipeDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Sản phẩm #${createRecipeDto.productId} không tồn tại`,
      );
    }

    // Kiểm tra đã có công thức chưa
    const existing = await this.prisma.recipe.findUnique({
      where: { productId: createRecipeDto.productId },
    });

    if (existing) {
      throw new ConflictException(
        `Sản phẩm này đã có công thức rồi. Hãy dùng update thay vì create.`,
      );
    }

    return this.prisma.recipe.create({
      data: {
        productId: createRecipeDto.productId,
        description: createRecipeDto.description,
        ingredients: {
          createMany: {
            data: createRecipeDto.ingredients,
          },
        },
        steps: {
          createMany: {
            data: createRecipeDto.steps,
          },
        },
      },
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
  }

  // Cập nhật công thức
  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    // Kiểm tra recipe tồn tại
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException(`Công thức #${id} không tồn tại`);
    }

    // Xóa ingredients và steps cũ, tạo mới
    return this.prisma.$transaction(async (tx) => {
      // Xóa cũ
      await tx.recipeIngredient.deleteMany({
        where: { recipeId: id },
      });
      await tx.recipeStep.deleteMany({
        where: { recipeId: id },
      });

      // Cập nhật và tạo mới
      return tx.recipe.update({
        where: { id },
        data: {
          description: updateRecipeDto.description,
          ...(updateRecipeDto.ingredients && {
            ingredients: {
              createMany: {
                data: updateRecipeDto.ingredients,
              },
            },
          }),
          ...(updateRecipeDto.steps && {
            steps: {
              createMany: {
                data: updateRecipeDto.steps,
              },
            },
          }),
        },
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
    });
  }

  // Xóa công thức
  async remove(id: number) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundException(`Công thức #${id} không tồn tại`);
    }

    // Prisma sẽ tự động xóa ingredients và steps nhờ onDelete: Cascade
    await this.prisma.recipe.delete({
      where: { id },
    });

    return {
      message: 'Đã xóa công thức thành công',
      id,
    };
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
