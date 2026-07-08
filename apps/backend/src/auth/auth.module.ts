import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      global: true, // Biar bisa dipakai di modul lain nanti
      secret: 'RAHASIA_NEGARA_SIGAP_IT_2026', // <-- Ganti pakai string bebas sesuka lu
      signOptions: { expiresIn: '1d' }, // Token hangus dalam 1 hari
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService], // Suntikkan PrismaService di sini
})
export class AuthModule {}
