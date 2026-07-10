import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const department = await this.prisma.department.create({
      data: createDepartmentDto,
    });
    return {
      success: true,
      message: 'Departemen baru berhasil ditambahkan! 🏢',
      data: department,
    };
  }

  async findAll() {
    const departments = await this.prisma.department.findMany();
    return {
      success: true,
      message: 'Semua data Departemen berhasil ditarik!',
      data: departments,
    };
  }

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException(`Departemen dengan ID #${id} tidak ditemukan!`);
    }
    return {
      success: true,
      message: `Detail Departemen ID #${id} berhasil ditemukan!`,
      data: department,
    };
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findOne(id); // Pastikan ada
    const updatedDepartment = await this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
    });
    return {
      success: true,
      message: `Departemen ID #${id} berhasil diupdate!`,
      data: updatedDepartment,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.department.delete({
      where: { id },
    });
    return {
      success: true,
      message: `Departemen ID #${id} berhasil dihapus! 🗑️`,
      data: null,
    };
  }
}
