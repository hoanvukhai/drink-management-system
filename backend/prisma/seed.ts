// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.user.findFirst({
    where: {
      role: 'ADMIN', // Hoặc check theo email/username tùy logic của bạn
    },
  });

  if (!adminExists) {
    // --- KHẮC PHỤC LỖI TẠI ĐÂY ---
    // Dùng toán tử || để tạo giá trị dự phòng (fallback)
    // Nghĩa là: Nếu không tìm thấy biến môi trường thì dùng '123456'
    const password = process.env.DEFAULT_ADMIN_PASSWORD || '123456';

    // Lúc này password chắc chắn là string, bcrypt sẽ không báo lỗi nữa
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword, // Đã sửa lỗi type
        name: 'Super Admin',
        role: 'ADMIN', // Đảm bảo Enum Role.ADMIN đúng với schema
      },
    });

    console.log(`Created admin user with password: ${password}`);
  } else {
    console.log('User "admin" already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
