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
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() dto: CreateAttendanceDto) {
    return this.service.create(dto);
  }

  @Post('check-in')
  checkIn(@Body() dto: CheckInDto) {
    return this.service.checkIn(dto);
  }

  @Patch(':id/check-out')
  checkOut(@Param('id', ParseIntPipe) id: number, @Body() dto: CheckOutDto) {
    return this.service.checkOut(id, dto);
  }

  @Patch('user/:userId/check-out')
  checkOutByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CheckOutDto,
  ) {
    return this.service.checkOutByUserId(userId, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@Query() query: QueryAttendanceDto) {
    return this.service.findAll(query);
  }

  @Get('active/:userId')
  getActiveAttendance(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getActiveAttendance(userId);
  }

  @Get('reports/working-hours')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getWorkingHoursSummary(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getWorkingHoursSummary(
      userId ? parseInt(userId) : undefined,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
