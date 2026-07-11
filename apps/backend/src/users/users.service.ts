import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // 1. Suntik PrismaService ke dalam constructor
  constructor(private prisma: PrismaService) { }

  // ==========================================
  // C = CREATE (Registrasi / Tambah Karyawan)
  // ==========================================
  async create(createUserDto: CreateUserDto) {
    // A. Cek apakah email sudah terdaftar
    const emailExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (emailExists) {
      throw new ConflictException(
        `Email ${createUserDto.email} sudah dipakai, bre!`,
      );
    }

    // B. JALANKAN PROSES JURUS ENKRIPSI DI SINI 😎
    const saltRound = 10; // Standar keamanan industri
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRound);

    // C. Eksekusi simpan ke MySQL via Prisma dengan password yang sudah di-hash
    const newUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword, // <--- Timpa password polos dengan yang sudah di-hash!
      },
    });

    return {
      success: true,
      message: 'User baru berhasil didaftarkan dengan aman! 👤✨',
      data: newUser,
    };
  }

  // ==========================================
  // R = READ ALL (Ambil Semua Karyawan + Role & Dept)
  // ==========================================
  async findAll(page: string = '1', limit: string = '10', roleId?: string) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = { isActive: true };
    if (roleId) {
      const roleIds = roleId.split(',').map(Number);
      whereClause.roleId = { in: roleIds };
    }

    const [result, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        include: {
          role: true,
          department: true,
          position: true,
        },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    return {
      success: true,
      message: 'Seluruh data karyawan berhasil ditarik!',
      data: result,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  // ==========================================
  // R = READ ONE (Ambil 1 Karyawan Berdasarkan ID)
  // ==========================================
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        department: true,
        position: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User dengan ID #${id} gak ketemu, bre!`);
    }

    return {
      success: true,
      message: `Data detail User ID #${id} berhasil ditemukan!`,
      data: user,
    };
  }

  // ==========================================
  // U = UPDATE (Edit Data Karyawan)
  // ==========================================
  async update(id: number, updateUserDto: UpdateUserDto) {
    // Pastikan user-nya ada dulu di DB
    await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return {
      success: true,
      message: `Data User ID #${id} sukses diperbarui, mantap!`,
      data: updatedUser,
    };
  }

  // ==========================================
  // D = DELETE (Hapus Karyawan dari Sistem - Soft Delete)
  // ==========================================
  async remove(id: number) {
    // Pastikan user-nya ada dulu di DB
    await this.findOne(id);

    // SOFT DELETE: Jangan hapus datanya, cukup matikan statusnya!
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      success: true,
      message: `User ID #${id} resmi di-nonaktifkan (Soft Delete)! Histori aman. 🗑️`,
      data: null,
    };
  }
}
