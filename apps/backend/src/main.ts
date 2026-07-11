import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <--- 1. JANGAN LUPA IMPORT INI
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files (untuk file upload / attachment)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 2. JIMAT CORS: Biar Next.js lu besok gak kena blokir browser
  app.enableCors();

  // 3. SATPAM GLOBAL: Biar DTO Users & Documents lu aktif nyaring data kotor
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Buang field ghaib yang gak terdaftar di DTO
      transform: true, // Otomatis konversi tipe data sesuai DTO
    }),
  );

  // 4. TETAP PAKAI PORT FLEKSIBEL LU, MANTAP!
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port} 🚀`);
}
bootstrap();
