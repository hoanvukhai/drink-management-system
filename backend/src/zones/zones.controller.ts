import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone.dto';

@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Post()
  create(@Body() createZoneDto: CreateZoneDto) {
    return this.zonesService.create(createZoneDto);
  }

  @Get()
  findAll() {
    return this.zonesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zonesService.remove(+id);
  }
}
