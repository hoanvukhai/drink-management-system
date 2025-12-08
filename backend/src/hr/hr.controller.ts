import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, ShiftStatus } from '@prisma/client';

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // =====================================================
  // ATTENDANCE
  // =====================================================

  @Post('attendance/check-in')
  checkIn(@Body() data: { userId: number; note?: string }) {
    return this.hrService.checkIn(data.userId, data.note);
  }

  @Post('attendance/check-out')
  checkOut(@Body() data: { userId: number; note?: string }) {
    return this.hrService.checkOut(data.userId, data.note);
  }

  @Get('attendance')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getAttendance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ) {
    return this.hrService.getAttendance(
      startDate,
      endDate,
      userId ? parseInt(userId) : undefined,
    );
  }

  @Get('attendance/summary/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getWorkingSummary(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('month') month: string, // format: YYYY-MM
  ) {
    return this.hrService.getWorkingSummary(userId, month);
  }

  // =====================================================
  // SHIFTS
  // =====================================================

  @Post('shifts')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  createShift(
    @Body()
    data: {
      userId: number;
      shiftName: string;
      startTime: string;
      endTime: string;
    },
  ) {
    return this.hrService.createShift({
      userId: data.userId,
      shiftName: data.shiftName,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    });
  }

  @Get('shifts')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getShifts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ) {
    return this.hrService.getShifts(
      startDate,
      endDate,
      userId ? parseInt(userId) : undefined,
    );
  }

  @Patch('shifts/:id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  updateShiftStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ShiftStatus,
  ) {
    return this.hrService.updateShiftStatus(id, status);
  }

  @Delete('shifts/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  deleteShift(@Param('id', ParseIntPipe) id: number) {
    return this.hrService.deleteShift(id);
  }

  // =====================================================
  // REPORTS
  // =====================================================

  @Get('reports/daily')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getDailyReport(@Query('date') date: string) {
    return this.hrService.getDailyReport(date);
  }
}
