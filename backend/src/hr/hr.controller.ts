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
  Request,
} from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, ShiftStatus } from '@prisma/client';

interface RequestWithUser {
  user: {
    userId: number;
    username: string;
    role: Role;
  };
}

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // ✅ EMPLOYEE có thể tự chấm công
  @Post('attendance/check-in')
  checkIn(@Body() data: { userId?: number }, @Request() req: RequestWithUser) {
    // Nếu không truyền userId, dùng userId của người đang login
    const userId = data.userId || req.user.userId;

    // 🔥 EMPLOYEE chỉ được chấm công cho chính mình
    if (req.user.role === Role.EMPLOYEE && userId !== req.user.userId) {
      throw new Error('Bạn chỉ được chấm công cho chính mình');
    }

    return this.hrService.checkIn(userId);
  }

  @Post('attendance/check-out')
  checkOut(@Body() data: { userId?: number }, @Request() req: RequestWithUser) {
    const userId = data.userId || req.user.userId;

    if (req.user.role === Role.EMPLOYEE && userId !== req.user.userId) {
      throw new Error('Bạn chỉ được chấm công cho chính mình');
    }

    return this.hrService.checkOut(userId);
  }

  // ✅ EMPLOYEE có thể xem chấm công của chính mình
  @Get('attendance')
  getAttendance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Request() req?: RequestWithUser,
  ) {
    // 🔥 EMPLOYEE chỉ xem được của mình
    if (req?.user.role === Role.EMPLOYEE) {
      return this.hrService.getAttendance(startDate, endDate, req.user.userId);
    }

    // ADMIN/MANAGER xem được tất cả
    return this.hrService.getAttendance(
      startDate,
      endDate,
      userId ? parseInt(userId) : undefined,
    );
  }

  @Get('attendance/summary/:userId')
  getWorkingSummary(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('month') month: string,
    @Request() req: RequestWithUser,
  ) {
    // 🔥 EMPLOYEE chỉ xem được của mình
    if (req.user.role === Role.EMPLOYEE && userId !== req.user.userId) {
      throw new Error('Bạn chỉ được xem thông tin của chính mình');
    }

    return this.hrService.getWorkingSummary(userId, month);
  }

  // ✅ CHỈ ADMIN/MANAGER quản lý ca làm
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

  @Get('reports/daily')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getDailyReport(@Query('date') date: string) {
    return this.hrService.getDailyReport(date);
  }
}
