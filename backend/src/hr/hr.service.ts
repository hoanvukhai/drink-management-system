import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShiftStatus } from '@prisma/client';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  // =====================================================
  // ATTENDANCE (Chấm công)
  // =====================================================

  // Check-in
  async checkIn(userId: number, note?: string) {
    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findFirst({
      where: {
        userId,
        checkIn: { gte: today },
        checkOut: null,
      },
    });

    if (existing) {
      throw new BadRequestException('Đã check-in hôm nay rồi');
    }

    return this.prisma.attendance.create({
      data: {
        userId,
        checkIn: new Date(),
        note,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  // Check-out
  async checkOut(userId: number, note?: string) {
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null,
      },
      orderBy: { checkIn: 'desc' },
    });

    if (!attendance) {
      throw new NotFoundException('Chưa check-in');
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: new Date(),
        note: note || attendance.note,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  // Get attendance history
  async getAttendance(startDate?: string, endDate?: string, userId?: number) {
    return this.prisma.attendance.findMany({
      where: {
        userId,
        checkIn: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
      orderBy: { checkIn: 'desc' },
    });
  }

  // Get working hours summary
  async getWorkingSummary(userId: number, month: string) {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        userId,
        checkIn: { gte: startDate, lte: endDate },
        checkOut: { not: null },
      },
    });

    const totalHours = attendances.reduce((sum, att) => {
      if (att.checkOut) {
        const hours =
          (att.checkOut.getTime() - att.checkIn.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);

    return {
      userId,
      month,
      totalDays: attendances.length,
      totalHours: Math.round(totalHours * 100) / 100,
      attendances,
    };
  }

  // =====================================================
  // SHIFTS (Ca làm việc)
  // =====================================================

  // Create shift
  async createShift(data: {
    userId: number;
    shiftName: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
  }) {
    // Validate user
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    return this.prisma.shift.create({
      data: {
        userId: data.userId,
        shiftName: data.shiftName,
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'ASSIGNED',
      },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  // Get shifts
  async getShifts(startDate?: string, endDate?: string, userId?: number) {
    return this.prisma.shift.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  // Update shift status
  async updateShiftStatus(shiftId: number, status: ShiftStatus) {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new NotFoundException('Shift không tồn tại');
    }

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, username: true },
        },
      },
    });
  }

  // Delete shift
  async deleteShift(shiftId: number) {
    return this.prisma.shift.delete({
      where: { id: shiftId },
    });
  }

  // =====================================================
  // REPORTS
  // =====================================================

  // Get all staff attendance for a date
  async getDailyReport(date: string) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        checkIn: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, role: true },
        },
      },
      orderBy: { checkIn: 'asc' },
    });

    const allUsers = await this.prisma.user.findMany({
      where: { role: { in: ['EMPLOYEE', 'MANAGER'] } },
    });

    return {
      date,
      present: attendances.length,
      total: allUsers.length,
      attendances,
    };
  }
}
