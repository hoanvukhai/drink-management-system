import { Injectable } from '@nestjs/common';
import { CreateInventoryCategoryDto } from './dto/create-inventory-category.dto';
import { UpdateInventoryCategoryDto } from './dto/update-inventory-category.dto';

@Injectable()
export class InventoryCategoriesService {
  create(createInventoryCategoryDto: CreateInventoryCategoryDto) {
    return 'This action adds a new inventoryCategory';
  }

  findAll() {
    return `This action returns all inventoryCategories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventoryCategory`;
  }

  update(id: number, updateInventoryCategoryDto: UpdateInventoryCategoryDto) {
    return `This action updates a #${id} inventoryCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventoryCategory`;
  }
}
