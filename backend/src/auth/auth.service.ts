// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // --- HÀM 1: ĐĂNG KÝ (REGISTER) ---
  async register(registerDto: RegisterDto) {
    const { username, password, name, role } = registerDto;

    // 1. Kiểm tra xem email đã tồn tại chưa
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 2. Mã hóa mật khẩu (Bcrypt)
    const hashedPassword = await bcrypt.hash(password, 10); // 10 là "salt rounds"

    // 3. Lưu user mới vào DB
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: role || 'EMPLOYEE', // Nếu không cung cấp, mặc định là EMPLOYEE
      },
    });

    // 4. Xóa mật khẩu khỏi đối tượng trả về
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  // --- HÀM 2: ĐĂNG NHẬP (LOGIN) ---
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 1. Tìm user bằng email
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. So sánh mật khẩu
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Tạo JWT Payload (Nội dung của Token)
    // Đây là thông tin sẽ được mã hóa vào token
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    // 4. Tạo và trả về token
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }
}
