import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StockTakesService } from './stock-takes.service';
import { CreateStockTakeDto } from './dto/create-stock-take.dto';
import { UpdateStockTakeDto } from './dto/update-stock-take.dto';

@Controller('stock-takes')
export class StockTakesController {
  constructor(private readonly stockTakesService: StockTakesService) {}

  @Post()
  create(@Body() createStockTakeDto: CreateStockTakeDto) {
    return this.stockTakesService.create(createStockTakeDto);
  }

  @Get()
  findAll() {
    return this.stockTakesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockTakesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockTakeDto: UpdateStockTakeDto) {
    return this.stockTakesService.update(+id, updateStockTakeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockTakesService.remove(+id);
  }
}
