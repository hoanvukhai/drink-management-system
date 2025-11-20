import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

interface JwtPayload {
  userId: number;
  username: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Lấy token từ Header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Từ chối nếu token hết hạn
      secretOrKey: 'day-la-chuoi-bi-mat-cua-toi-cho-du-an-cafe-123456',
    });
  }

  // Hàm này chạy khi Token hợp lệ.
  // Nó trả về thông tin user và gán vào 'req.user'
  validate(payload: JwtPayload) {
    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
  }
}
