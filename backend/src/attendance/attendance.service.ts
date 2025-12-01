import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { Prisma } from '@prisma/client';

export interface WorkingHoursSummary {
  userId: number;
  userName: string;
  totalHours: number;
  totalDays: number;
}

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAttendanceDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User #${dto.userId} not found`);
    }

    return this.prisma.attendance.create({
      data: {
        userId: dto.userId,
        checkIn: new Date(dto.checkIn),
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
        notes: dto.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  // Check-in (tạo attendance record mới)
  async checkIn(dto: CheckInDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User #${dto.userId} not found`);
    }

    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await this.prisma.attendance.findFirst({
      where: {
        userId: dto.userId,
        checkIn: {
          gte: today,
          lt: tomorrow,
        },
        checkOut: null,
      },
    });

    if (existingCheckIn) {
      throw new BadRequestException('User already checked in today');
    }

    return this.prisma.attendance.create({
      data: {
        userId: dto.userId,
        checkIn: new Date(),
        notes: dto.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  // Check-out
  async checkOut(attendanceId: number, dto: CheckOutDto) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance #${attendanceId} not found`);
    }

    if (attendance.checkOut) {
      throw new BadRequestException('Already checked out');
    }

    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        checkOut: new Date(),
        notes: dto.notes || attendance.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  // Check-out by userId (tìm attendance record chưa checkout)
  async checkOutByUserId(userId: number, dto: CheckOutDto) {
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null,
      },
      orderBy: {
        checkIn: 'desc',
      },
    });

    if (!attendance) {
      throw new NotFoundException('No active check-in found for this user');
    }

    return this.checkOut(attendance.id, dto);
  }

  findAll(query?: QueryAttendanceDto) {
    const where: Prisma.AttendanceWhereInput = {};

    if (query?.userId) {
      where.userId = query.userId;
    }

    if (query?.startDate || query?.endDate) {
      where.checkIn = {};
      if (query.startDate) {
        where.checkIn.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.checkIn.lte = new Date(query.endDate);
      }
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: { checkIn: 'desc' },
    });
  }

  async findOne(id: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance #${id} not found`);
    }

    return attendance;
  }

  // Get current active attendance for user
  async getActiveAttendance(userId: number) {
    return this.prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null,
      },
      orderBy: {
        checkIn: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  async update(id: number, dto: UpdateAttendanceDto) {
    await this.findOne(id);

    const data: Prisma.AttendanceUpdateInput = {};

    if (dto.checkIn) {
      data.checkIn = new Date(dto.checkIn);
    }
    if (dto.checkOut) {
      data.checkOut = new Date(dto.checkOut);
    }
    if (dto.notes !== undefined) {
      data.notes = dto.notes;
    }

    return this.prisma.attendance.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.attendance.delete({
      where: { id },
    });
  }

  // Report: Working hours summary
  async getWorkingHoursSummary(
    userId?: number,
    startDate?: string,
    endDate?: string,
  ) {
    const where: Prisma.AttendanceWhereInput = {
      checkOut: { not: null },
    };

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.checkIn = {};
      if (startDate) where.checkIn.gte = new Date(startDate);
      if (endDate) where.checkIn.lte = new Date(endDate);
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    // Group by user
    const grouped = attendances.reduce(
      (acc, a) => {
        const userId = a.userId;
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName: a.user.name || a.user.username,
            totalHours: 0,
            totalDays: 0,
          };
        }

        if (a.checkOut) {
          const hours =
            (new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime()) /
            (1000 * 60 * 60);
          acc[userId].totalHours += hours;
          acc[userId].totalDays += 1;
        }

        return acc;
      },
      {} as Record<number, WorkingHoursSummary>,
    );

    return Object.values(grouped);
  }
}
