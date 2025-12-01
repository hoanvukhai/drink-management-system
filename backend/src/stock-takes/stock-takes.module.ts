import { Module } from '@nestjs/common';
import { StockTakesService } from './stock-takes.service';
import { StockTakesController } from './stock-takes.controller';

@Module({
  controllers: [StockTakesController],
  providers: [StockTakesService],
})
export class StockTakesModule {}
