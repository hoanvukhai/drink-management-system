// src/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

interface UserRequest {
  user?: {
    role: Role;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Đọc "Biển báo" (Roles) xem API này yêu cầu quyền gì
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu không yêu cầu quyền gì đặc biệt => Cho qua
    if (!requiredRoles) {
      return true;
    }

    // 2. Lấy thông tin User đang đăng nhập (từ request)
    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;

    // Nếu không có user (chưa login) => Chặn
    if (!user) {
      return false;
    }

    // 3. Admin là trùm cuối, luôn được qua (tùy chọn)
    if (user.role === Role.ADMIN) {
      return true;
    }

    // 4. Kiểm tra xem Role của User có nằm trong danh sách yêu cầu không
    return requiredRoles.includes(user.role);
  }
}
