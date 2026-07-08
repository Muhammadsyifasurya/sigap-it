import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <--- 1. JANGAN LUPA IMPORT INI

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
