import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  // POST /recipes - Tạo công thức mới
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(createRecipeDto);
  }

  // GET /recipes - Lấy tất cả công thức
  @Get()
  findAll() {
    return this.recipesService.findAll();
  }

  // GET /recipes/product/:productId - Lấy công thức theo productId
  @Get('product/:productId')
  getByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.recipesService.getByProduct(productId);
  }

  // GET /recipes/:id - Lấy công thức theo ID (không cần thiết lắm)
  // Nếu muốn có thể thêm findOne() vào service

  // PATCH /recipes/:id - Cập nhật công thức
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  // DELETE /recipes/:id - Xóa công thức
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recipesService.remove(id);
  }
}
