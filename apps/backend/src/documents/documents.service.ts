import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
  ) {
    // 2. AMBIL JALUR STRUKTUR FOLDER TEMPAT FILE DISIMPAN (misal: uploads/doc-xxx.pdf)
    const filePath = file ? file.path : '';

    // 3. PETAKAN FIELD SECARA MANUAL BIAR TS & PRISMA BISA BACA DENGAN JELAS
    const result = await this.prisma.document.create({
      data: {
        title: createDocumentDto.title,
        docNumber: createDocumentDto.docNumber,
        level: createDocumentDto.level || 'REGULASI',
        currentVersion: createDocumentDto.currentVersion || 'v1.0',
        status: createDocumentDto.status || 'DRAFT',
        filePath: filePath,

        // Ambil data tanggal dari DTO jika user menginputkannya dari luar
        publishDate: createDocumentDto.publishDate
          ? new Date(createDocumentDto.publishDate)
          : null,
        expiryDate: createDocumentDto.expiryDate
          ? new Date(createDocumentDto.expiryDate)
          : null,

        creator: {
          connect: { id: 2 },
        },
      },
    });

    return {
      success: true,
      message: 'Dokumen regulasi beserta file fisiknya berhasil disimpan! 📄🚀',
      data: result,
    };
  }

  async findAll(page: string = '1', limit: string = '10') {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [documents, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        skip,
        take: limitNum,
        include: {
          creator: { select: { name: true, department: { select: { name: true } } } },
        },
      }),
      this.prisma.document.count(),
    ]);

    return {
      success: true,
      data: documents,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
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
    // 1. Pastikan dokumennya emang ada di database
    await this.findOne(id);

    // 2. Copy data dari DTO ke dalam objek baru yang tipenya aman (Prisma Input)
    const updateData: any = { ...updateDocumentDto };

    // 3. LOGIKA OTOMATIS: Jika status di-update menjadi ACTIVE (Dokumen Sah)
    if (updateDocumentDto.status === 'ACTIVE') {
      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1); // Otomatis nambah 1 tahun masa berlaku

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updateData.publishDate = today;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      updateData.expiryDate = nextYear;
    }

    // 4. Eksekusi update ke MySQL via Prisma
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.prisma.document.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: `Dokumen ID #${id} berhasil diperbarui dan status disinkronisasikan! 🔄🔥`,
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
