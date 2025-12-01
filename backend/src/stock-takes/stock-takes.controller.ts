import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockTakesService } from './stock-takes.service';
import { CreateStockTakeDto } from './dto/create-stock-take.dto';
import { UpdateStockTakeDto } from './dto/update-stock-take.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('stock-takes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class StockTakesController {
  constructor(private readonly service: StockTakesService) {}

  @Post()
  create(@Body() dto: CreateStockTakeDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockTakeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.service.complete(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
