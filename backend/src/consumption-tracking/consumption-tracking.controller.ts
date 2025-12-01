import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConsumptionTrackingService } from './consumption-tracking.service';
import { CreateConsumptionTrackingDto } from './dto/create-consumption-tracking.dto';
import { UpdateConsumptionTrackingDto } from './dto/update-consumption-tracking.dto';

@Controller('consumption-tracking')
export class ConsumptionTrackingController {
  constructor(private readonly consumptionTrackingService: ConsumptionTrackingService) {}

  @Post()
  create(@Body() createConsumptionTrackingDto: CreateConsumptionTrackingDto) {
    return this.consumptionTrackingService.create(createConsumptionTrackingDto);
  }

  @Get()
  findAll() {
    return this.consumptionTrackingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumptionTrackingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConsumptionTrackingDto: UpdateConsumptionTrackingDto) {
    return this.consumptionTrackingService.update(+id, updateConsumptionTrackingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consumptionTrackingService.remove(+id);
  }
}
