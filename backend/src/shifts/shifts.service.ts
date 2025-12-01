import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { UpdateShiftStatusDto } from './dto/update-shift-status.dto';
import { QueryShiftsDto } from './dto/query-shifts.dto';
import { Prisma, ShiftStatus } from '@prisma/client';

export interface ShiftSummary {
  userId: number;
  userName: string;
  total: number;
  assigned: number;
  started: number;
  ended: number;
  cancelled: number;
  totalHours: number;
}

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateShiftDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User #${dto.userId} not found`);
    }

    // Check for overlapping shifts
    const overlapping = await this.prisma.shift.findFirst({
      where: {
        userId: dto.userId,
        status: { not: ShiftStatus.CANCELLED },
        OR: [
          {
            startTime: {
              lte: new Date(dto.endTime),
            },
            endTime: {
              gte: new Date(dto.startTime),
            },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Shift overlaps with existing shift');
    }

    return this.prisma.shift.create({
      data: {
        userId: dto.userId,
        shiftName: dto.shiftName,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        status: dto.status || ShiftStatus.ASSIGNED,
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

  findAll(query?: QueryShiftsDto) {
    const where: Prisma.ShiftWhereInput = {};

    if (query?.userId) {
      where.userId = query.userId;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.startDate || query?.endDate) {
      where.startTime = {};
      if (query.startDate) {
        where.startTime.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.startTime.lte = new Date(query.endDate);
      }
    }

    return this.prisma.shift.findMany({
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
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: number) {
    const shift = await this.prisma.shift.findUnique({
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

    if (!shift) {
      throw new NotFoundException(`Shift #${id} not found`);
    }

    return shift;
  }

  // Get today's shifts
  async getTodayShifts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.shift.findMany({
      where: {
        startTime: {
          gte: today,
          lt: tomorrow,
        },
        status: { not: ShiftStatus.CANCELLED },
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
      orderBy: { startTime: 'asc' },
    });
  }

  // Get upcoming shifts for user
  async getUpcomingShifts(userId: number) {
    return this.prisma.shift.findMany({
      where: {
        userId,
        startTime: {
          gte: new Date(),
        },
        status: { not: ShiftStatus.CANCELLED },
      },
      orderBy: { startTime: 'asc' },
      take: 10,
    });
  }

  async update(id: number, dto: UpdateShiftDto) {
    await this.findOne(id);

    const data: Prisma.ShiftUpdateInput = {};

    if (dto.shiftName) data.shiftName = dto.shiftName;
    if (dto.startTime) data.startTime = new Date(dto.startTime);
    if (dto.endTime) data.endTime = new Date(dto.endTime);
    if (dto.status) data.status = dto.status;
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.shift.update({
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

  async updateStatus(id: number, dto: UpdateShiftStatusDto) {
    const shift = await this.findOne(id);

    // Validate status transitions
    if (
      shift.status === ShiftStatus.ENDED &&
      dto.status !== ShiftStatus.ENDED
    ) {
      throw new BadRequestException('Cannot change status of ended shift');
    }

    if (
      shift.status === ShiftStatus.CANCELLED &&
      dto.status !== ShiftStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot change status of cancelled shift');
    }

    return this.prisma.shift.update({
      where: { id },
      data: { status: dto.status },
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

  async startShift(id: number) {
    const shift = await this.findOne(id);

    if (shift.status !== ShiftStatus.ASSIGNED) {
      throw new BadRequestException('Can only start ASSIGNED shifts');
    }

    return this.prisma.shift.update({
      where: { id },
      data: { status: ShiftStatus.STARTED },
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

  async endShift(id: number) {
    const shift = await this.findOne(id);

    if (shift.status !== ShiftStatus.STARTED) {
      throw new BadRequestException('Can only end STARTED shifts');
    }

    return this.prisma.shift.update({
      where: { id },
      data: { status: ShiftStatus.ENDED },
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

  async cancelShift(id: number) {
    const shift = await this.findOne(id);

    if (shift.status === ShiftStatus.ENDED) {
      throw new BadRequestException('Cannot cancel ended shift');
    }

    return this.prisma.shift.update({
      where: { id },
      data: { status: ShiftStatus.CANCELLED },
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
    return this.prisma.shift.delete({
      where: { id },
    });
  }

  // Report: Shift summary
  async getShiftSummary(startDate?: string, endDate?: string) {
    const where: Prisma.ShiftWhereInput = {};

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate) where.startTime.lte = new Date(endDate);
    }

    const shifts = await this.prisma.shift.findMany({
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

    // Group by user and status
    const summary = shifts.reduce(
      (acc, shift) => {
        const userId = shift.userId;
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName: shift.user.name || shift.user.username,
            total: 0,
            assigned: 0,
            started: 0,
            ended: 0,
            cancelled: 0,
            totalHours: 0,
          };
        }

        acc[userId].total += 1;

        switch (shift.status) {
          case ShiftStatus.ASSIGNED:
            acc[userId].assigned += 1;
            break;
          case ShiftStatus.STARTED:
            acc[userId].started += 1;
            break;
          case ShiftStatus.ENDED:
            acc[userId].ended += 1;
            break;
          case ShiftStatus.CANCELLED:
            acc[userId].cancelled += 1;
            break;
        }

        // Calculate hours for ended shifts
        if (shift.status === ShiftStatus.ENDED) {
          const hours =
            (new Date(shift.endTime).getTime() -
              new Date(shift.startTime).getTime()) /
            (1000 * 60 * 60);
          acc[userId].totalHours += hours;
        }

        return acc;
      },
      {} as Record<number, ShiftSummary>,
    );

    return Object.values(summary);
  }
}
