import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.prisma.role.create({
      data: createRoleDto,
    });
    return {
      success: true,
      message: 'Role baru berhasil ditambahkan! 🏢',
      data: role,
    };
  }

  async findAll() {
    const roles = await this.prisma.role.findMany();
    return {
      success: true,
      message: 'Semua data Role berhasil ditarik!',
      data: roles,
    };
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role dengan ID #${id} tidak ditemukan!`);
    }
    return {
      success: true,
      message: `Detail Role ID #${id} berhasil ditemukan!`,
      data: role,
    };
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.findOne(id); // Pastikan ada dulu
    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
    return {
      success: true,
      message: `Role ID #${id} berhasil diupdate!`,
      data: updatedRole,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.role.delete({
      where: { id },
    });
    return {
      success: true,
      message: `Role ID #${id} berhasil dihapus! 🗑️`,
      data: null,
    };
  }
}
