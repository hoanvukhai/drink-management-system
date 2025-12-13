import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';

interface CurrentUser {
  userId: number;
  username: string;
  role: Role;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password, name, role } = createUserDto;

    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) throw new ConflictException('Username đã tồn tại');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { username, password: hashedPassword, name, role },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true },
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, name: true, role: true },
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUser: CurrentUser,
  ) {
    // 🔥 Tìm user đang được sửa
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) throw new NotFoundException('User không tồn tại');

    // 🔥 MANAGER không được sửa ADMIN hoặc MANAGER khác
    if (currentUser.role === Role.MANAGER) {
      if (targetUser.role === Role.ADMIN || targetUser.role === Role.MANAGER) {
        throw new ForbiddenException(
          'Manager không được chỉnh sửa Admin hoặc Manager',
        );
      }
      // 🔥 MANAGER không được nâng EMPLOYEE lên ADMIN/MANAGER
      if (
        updateUserDto.role === Role.ADMIN ||
        updateUserDto.role === Role.MANAGER
      ) {
        throw new ForbiddenException(
          'Manager không được thay đổi role thành Admin hoặc Manager',
        );
      }
    }

    const data: Prisma.UserUpdateInput = {};
    if (updateUserDto.name !== undefined) data.name = updateUserDto.name;
    if (updateUserDto.role !== undefined) data.role = updateUserDto.role;
    if (updateUserDto.password) {
      const hashed = await bcrypt.hash(updateUserDto.password, 10);
      data.password = hashed;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, username: true, name: true, role: true },
    });

    return updated;
  }

  async remove(id: number, currentUser: CurrentUser) {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) throw new NotFoundException('User không tồn tại');

    // 🔥 MANAGER không được xóa ADMIN hoặc MANAGER
    if (currentUser.role === Role.MANAGER) {
      if (targetUser.role === Role.ADMIN || targetUser.role === Role.MANAGER) {
        throw new ForbiddenException(
          'Manager không được xóa Admin hoặc Manager',
        );
      }
    }

    // 🔥 Không được xóa chính mình
    if (targetUser.id === currentUser.userId) {
      throw new ForbiddenException('Không thể xóa chính mình');
    }

    return this.prisma.user.delete({ where: { id } });
  }
}
