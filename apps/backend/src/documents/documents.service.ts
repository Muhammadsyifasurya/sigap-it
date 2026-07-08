import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto) {
    const result = await this.prisma.document.create({
      data: createDocumentDto,
    });

    return {
      success: true,
      message: 'Dokumen berhasil dibuat, mantap!',
      data: result,
    };
  }

  async findAll() {
    const result = await this.prisma.document.findMany();

    return {
      success: true,
      message: 'Semua data dokumen berhasil ditarik!',
      data: result,
    };
  }

  async findOne(id: number) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(
        `Dokumen dengan ID #${id} tidak ditemukan, bre!`,
      );
    }

    return {
      success: true,
      message: `Detail dokumen ID #${id} berhasil ditemukan!`,
      data: document,
    };
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto) {
    await this.findOne(id);

    const result = await this.prisma.document.update({
      where: { id },
      data: updateDocumentDto,
    });

    return {
      success: true,
      message: `Dokumen ID #${id} berhasil diperbarui, mantap!`,
      data: result,
    };
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.document.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Dokumen ID #${id} sukses didelete dari Docker! 🗑️`,
      data: null,
    };
  }
}
