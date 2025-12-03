// =====================================================
// backend/src/inventory/inventory.controller.ts
// =====================================================

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, TransactionType } from '@prisma/client';

interface RequestWithUser extends Request {
  user: {
    userId: number;
    username: string;
    role: Role;
  };
}

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // =====================================================
  // INGREDIENTS CRUD
  // =====================================================

  @Get('ingredients')
  getAllIngredients() {
    return this.inventoryService.getAllIngredients();
  }

  @Post('ingredients')
  @Roles(Role.ADMIN, Role.MANAGER)
  createIngredient(
    @Body() data: { name: string; unit: string; minStock?: number },
  ) {
    return this.inventoryService.createIngredient(data);
  }

  // =====================================================
  // STOCK OPERATIONS
  // =====================================================

  @Post('ingredients/:id/import')
  @Roles(Role.ADMIN, Role.MANAGER)
  importStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { quantity: number; price: number; note?: string },
    @Request() req: RequestWithUser,
  ) {
    return this.inventoryService.importStock(
      id,
      data.quantity,
      data.price,
      data.note,
      req.user.userId,
    );
  }

  @Post('ingredients/:id/stocktake')
  @Roles(Role.ADMIN, Role.MANAGER)
  stocktake(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { actualStock: number; reason: string },
    @Request() req: RequestWithUser,
  ) {
    return this.inventoryService.stocktake(
      id,
      data.actualStock,
      data.reason,
      req.user.userId,
    );
  }

  @Post('ingredients/:id/damage')
  @Roles(Role.ADMIN, Role.MANAGER)
  reportDamage(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { quantity: number; reason: string },
    @Request() req: RequestWithUser,
  ) {
    return this.inventoryService.reportDamage(
      id,
      data.quantity,
      data.reason,
      req.user.userId,
    );
  }

  // =====================================================
  // REPORTS
  // =====================================================

  @Get('report')
  @Roles(Role.ADMIN, Role.MANAGER)
  getInventoryReport() {
    return this.inventoryService.getInventoryReport();
  }

  @Get('cogs')
  @Roles(Role.ADMIN, Role.MANAGER)
  getCOGSReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.inventoryService.calculateCOGS(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('transactions')
  @Roles(Role.ADMIN, Role.MANAGER)
  getTransactions(
    @Query('ingredientId') ingredientId?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getTransactions({
      ingredientId: ingredientId ? Number.parseInt(ingredientId) : undefined,
      type: type ? (type as TransactionType) : undefined,
      limit: limit ? Number.parseInt(limit) : 50,
    });
  }
}
