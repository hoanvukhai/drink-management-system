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
import { ConsumptionTrackingService } from './consumption-tracking.service';
import { CreateConsumptionTrackingDto } from './dto/create-consumption-tracking.dto';
import { UpdateConsumptionTrackingDto } from './dto/update-consumption-tracking.dto';
import { QueryConsumptionDto } from './dto/query-consumption.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('consumption-tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class ConsumptionTrackingController {
  constructor(private readonly service: ConsumptionTrackingService) {}

  @Post()
  create(@Body() dto: CreateConsumptionTrackingDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryConsumptionDto) {
    return this.service.findAll(query);
  }

  @Get('reports/by-item')
  getConsumptionByItem(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getConsumptionByItem(startDate, endDate);
  }

  @Get('reports/by-reason')
  getConsumptionByReason(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getConsumptionByReason(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConsumptionTrackingDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
