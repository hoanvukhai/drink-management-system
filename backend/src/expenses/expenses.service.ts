import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  create(createExpenseDto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: createExpenseDto,
    });
  }

  findAll(startDate?: string, endDate?: string) {
    return this.prisma.expense.findMany({
      where: {
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getSummary(startDate?: string, endDate?: string) {
    const expenses = await this.findAll(startDate, endDate);

    const byType = expenses.reduce(
      (acc, exp) => {
        if (!acc[exp.type]) {
          acc[exp.type] = 0;
        }
        acc[exp.type] += exp.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      byType,
      count: expenses.length,
    };
  }

  async findOne(id: number) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException(`Expense #${id} not found`);
    return expense;
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto) {
    await this.findOne(id);
    return this.prisma.expense.update({
      where: { id },
      data: updateExpenseDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.expense.delete({ where: { id } });
  }
}
