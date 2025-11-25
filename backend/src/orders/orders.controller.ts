import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, AddItemsDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Post(':id/items')
  addItems(
    @Param('id', ParseIntPipe) id: number,
    @Body() addItemsDto: AddItemsDto,
  ) {
    return this.ordersService.addItems(id, addItemsDto);
  }

  @Delete(':orderId/items/:itemId')
  removeItem(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.ordersService.removeItem(orderId, itemId);
  }

  @Patch(':id/ready')
  markAsReady(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.markAsReady(id);
  }

  @Patch(':orderId/items/:itemId/served')
  markItemServed(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.ordersService.markItemServed(orderId, itemId);
  }

  @Patch(':id/move')
  moveTable(
    @Param('id', ParseIntPipe) id: number,
    @Body('newTableId') newTableId: number,
  ) {
    return this.ordersService.moveTable(id, newTableId);
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.complete(id);
  }

  // 👇 THÊM CÁC ENDPOINT NÀY
  @Get('for-server')
  findForServer() {
    return this.ordersService.findForServer();
  }

  @Get('for-kitchen')
  findForKitchen() {
    return this.ordersService.findForKitchen();
  }

  @Get('for-cashier')
  findForCashier() {
    return this.ordersService.findForCashier();
  }

  @Get('table/:tableId')
  getActiveOrderByTable(@Param('tableId', ParseIntPipe) tableId: number) {
    return this.ordersService.getActiveOrderByTable(tableId);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }
}
