// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint để đăng ký tài khoản mới
   */
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Endpoint để đăng nhập
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // Mặc định POST trả về 201, đổi thành 200
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
