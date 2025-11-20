import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client'; // <-- Import 'Role' từ Prisma

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsString()
  @IsOptional() // Dấu ? nghĩa là không bắt buộc
  name?: string;

  @IsEnum(Role) // Đảm bảo role là 1 trong các giá trị của enum
  @IsOptional() // Thường Admin sẽ set role, user tự đăng ký thì không
  role?: Role;
}
