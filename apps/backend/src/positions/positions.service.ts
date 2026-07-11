import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPositionDto: CreatePositionDto) {
    const position = await this.prisma.position.create({
      data: createPositionDto,
    });
    return { success: true, message: 'Jabatan berhasil ditambahkan', data: position };
  }

  async findAll() {
    const positions = await this.prisma.position.findMany();
    return { success: true, message: 'Data jabatan berhasil diambil', data: positions };
  }

  async findOne(id: number) {
    const position = await this.prisma.position.findUnique({
      where: { id },
    });
    if (!position) throw new NotFoundException(`Jabatan #${id} tidak ditemukan`);
    return { success: true, data: position };
  }

  async update(id: number, updatePositionDto: UpdatePositionDto) {
    await this.findOne(id);
    const position = await this.prisma.position.update({
      where: { id },
      data: updatePositionDto,
    });
    return { success: true, message: 'Jabatan berhasil diupdate', data: position };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.position.delete({
      where: { id },
    });
    return { success: true, message: 'Jabatan berhasil dihapus' };
  }
}
