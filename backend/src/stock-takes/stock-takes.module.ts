import { Module } from '@nestjs/common';
import { StockTakesService } from './stock-takes.service';
import { StockTakesController } from './stock-takes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StockTakesController],
  providers: [StockTakesService],
})
export class StockTakesModule {}
