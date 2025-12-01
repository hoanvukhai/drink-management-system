import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventoryCategoriesService } from './inventory-categories.service';
import { CreateInventoryCategoryDto } from './dto/create-inventory-category.dto';
import { UpdateInventoryCategoryDto } from './dto/update-inventory-category.dto';

@Controller('inventory-categories')
export class InventoryCategoriesController {
  constructor(private readonly inventoryCategoriesService: InventoryCategoriesService) {}

  @Post()
  create(@Body() createInventoryCategoryDto: CreateInventoryCategoryDto) {
    return this.inventoryCategoriesService.create(createInventoryCategoryDto);
  }

  @Get()
  findAll() {
    return this.inventoryCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventoryCategoryDto: UpdateInventoryCategoryDto) {
    return this.inventoryCategoriesService.update(+id, updateInventoryCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryCategoriesService.remove(+id);
  }
}
