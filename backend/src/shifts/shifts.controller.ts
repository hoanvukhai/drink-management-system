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
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { UpdateShiftStatusDto } from './dto/update-shift-status.dto';
import { QueryShiftsDto } from './dto/query-shifts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
  constructor(private readonly service: ShiftsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() dto: CreateShiftDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryShiftsDto) {
    return this.service.findAll(query);
  }

  @Get('today')
  getTodayShifts() {
    return this.service.getTodayShifts();
  }

  @Get('upcoming/:userId')
  getUpcomingShifts(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getUpcomingShifts(userId);
  }

  @Get('reports/summary')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getShiftSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getShiftSummary(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShiftDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShiftStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Patch(':id/start')
  startShift(@Param('id', ParseIntPipe) id: number) {
    return this.service.startShift(id);
  }

  @Patch(':id/end')
  endShift(@Param('id', ParseIntPipe) id: number) {
    return this.service.endShift(id);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  cancelShift(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancelShift(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
