import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  // UseGuards,
  Request,
} from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import {
  CreateIngredientDto,
  InventoryTransactionDto,
} from './dto/create-ingredient.dto';
// Nhớ import AuthGuard

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.create(createIngredientDto);
  }

  @Get()
  findAll() {
    return this.ingredientsService.findAll();
  }

  // API Đa năng: Nhập kho, Báo hỏng, Kiểm kê
  // POST /ingredients/1/transaction
  @Post(':id/transaction')
  transaction(
    @Param('id') id: string,
    @Body() dto: InventoryTransactionDto,
    // @Request() req, // Bỏ comment khi dùng AuthGuard
  ) {
    const userId = 1; // Tạm fix cứng, sau này lấy req.user.id
    return this.ingredientsService.handleTransaction(+id, dto, userId);
  }
}
