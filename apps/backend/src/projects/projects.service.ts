import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    const project = await this.prisma.itProject.create({
      data: {
        ...createProjectDto,
        startDate: new Date(createProjectDto.startDate),
        endDate: new Date(createProjectDto.endDate),
        status: createProjectDto.status || 'PLANNING',
        progress: createProjectDto.progress || 0,
      },
    });
    return {
      success: true,
      message: 'Proyek IT baru berhasil didaftarkan! 🚀',
      data: project,
    };
  }

  async findAll() {
    const projects = await this.prisma.itProject.findMany({
      include: {
        manager: { select: { name: true, department: { select: { name: true } } } },
      },
    });
    return {
      success: true,
      data: projects,
    };
  }

  async findOne(id: number) {
    const project = await this.prisma.itProject.findUnique({
      where: { id },
      include: {
        manager: { select: { name: true } },
      },
    });
    if (!project) throw new NotFoundException(`Project #${id} tidak ditemukan!`);
    return {
      success: true,
      data: project,
    };
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id);
    const updated = await this.prisma.itProject.update({
      where: { id },
      data: {
        ...updateProjectDto,
        startDate: updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : undefined,
        endDate: updateProjectDto.endDate ? new Date(updateProjectDto.endDate) : undefined,
      },
    });
    return {
      success: true,
      message: 'Data proyek berhasil diperbarui!',
      data: updated,
    };
  }
}
