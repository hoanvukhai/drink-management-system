import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

interface RequestWithUser {
  user: {
    userId: number;
    username: string;
    role: Role;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ ADMIN/MANAGER có thể thêm nhân viên
  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(
    @Body() createUserDto: CreateUserDto,
    @Request() req: RequestWithUser,
  ) {
    // 🔥 MANAGER không được tạo ADMIN hoặc MANAGER khác
    if (req.user.role === Role.MANAGER) {
      if (
        createUserDto.role === Role.ADMIN ||
        createUserDto.role === Role.MANAGER
      ) {
        throw new ForbiddenException(
          'Manager không được tạo tài khoản Admin hoặc Manager',
        );
      }
    }

    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // ✅ UPDATE USER
  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: RequestWithUser,
  ) {
    // 🔥 MANAGER không được sửa ADMIN hoặc MANAGER khác
    return this.usersService.update(id, updateUserDto, req.user);
  }

  // ✅ DELETE USER
  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ) {
    // 🔥 MANAGER không được xóa ADMIN hoặc MANAGER
    return this.usersService.remove(id, req.user);
  }
}
