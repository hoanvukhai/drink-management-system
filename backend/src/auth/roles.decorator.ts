import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
// Hàm này giúp chúng ta dùng @Roles(Role.ADMIN, Role.MANAGER)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
