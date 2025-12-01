import { Injectable } from '@nestjs/common';
import { CreateStockTakeDto } from './dto/create-stock-take.dto';
import { UpdateStockTakeDto } from './dto/update-stock-take.dto';

@Injectable()
export class StockTakesService {
  create(createStockTakeDto: CreateStockTakeDto) {
    return 'This action adds a new stockTake';
  }

  findAll() {
    return `This action returns all stockTakes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stockTake`;
  }

  update(id: number, updateStockTakeDto: UpdateStockTakeDto) {
    return `This action updates a #${id} stockTake`;
  }

  remove(id: number) {
    return `This action removes a #${id} stockTake`;
  }
}
