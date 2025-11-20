// src/users/users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 1. Tạo nhân viên mới
  async create(createUserDto: CreateUserDto) {
    const { username, password, name, role } = createUserDto;

    // Check trùng
    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) throw new ConflictException('Username đã tồn tại');

    // Hash pass
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  // 2. Lấy danh sách nhân viên
  async findAll() {
    // Select để KHÔNG lấy cột password
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  // 3. Lấy 1 người (nếu cần)
  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, name: true, role: true },
    });
  }

  // 4. Xóa nhân viên
  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  // (Update tạm thời chưa cần thiết lắm, làm sau)
  async update(id: number, updateUserDto: UpdateUserDto) {
    const data: Prisma.UserUpdateInput = {};
    if (updateUserDto.name !== undefined) data.name = updateUserDto.name;
    if (updateUserDto.role !== undefined) data.role = updateUserDto.role;
    if (updateUserDto.password) {
      // Hash password
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
}
