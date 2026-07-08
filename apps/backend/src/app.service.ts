import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  // 1. Suntik kunci pas Prisma ke sini
  constructor(private prisma: PrismaService) {}

  async getHello() {
    // 2. Kita tes ambil data tabel "roles" dari dalam Docker
    const totalRoles = await this.prisma.role.findMany();

    // 3. Kembalikan data berupa JSON biar kelihatan di browser
    return {
      status: 'Koneksi Sukses Terjalin, Bre! 🚀',
      server: 'NestJS on localhost:4000',
      database: 'MySQL Docker (sigap_it)',
      isi_tabel_roles: totalRoles, // Bakal muncul [] karena datanya masih kosong
    };
  }
}
