import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { CreateHandoverDto } from './dto/create-handover.dto';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. MASTER ASSET (Laptop, PC, dll)
  // ==========================================
  async createAsset(createAssetDto: CreateAssetDto) {
    const asset = await this.prisma.itAsset.create({
      data: {
        ...createAssetDto,
        purchaseDate: createAssetDto.purchaseDate
          ? new Date(createAssetDto.purchaseDate)
          : null,
        status: 'AVAILABLE',
      },
    });
    return {
      success: true,
      message: 'Aset IT baru berhasil didaftarkan! 💻',
      data: asset,
    };
  }

  async findAll(page: string = '1', limit: string = '10') {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [assets, total] = await this.prisma.$transaction([
      this.prisma.itAsset.findMany({
        skip,
        take: limitNum,
        include: {
          currentUser: {
            select: { name: true, department: { select: { name: true } } },
          },
        },
      }),
      this.prisma.itAsset.count(),
    ]);

    return {
      success: true,
      message: 'Seluruh data Aset berhasil ditarik!',
      data: assets,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOneAsset(id: number) {
    const asset = await this.prisma.itAsset.findUnique({
      where: { id },
      include: { assetHandovers: true },
    });
    if (!asset) throw new NotFoundException(`Aset ID #${id} tidak ditemukan!`);
    return {
      success: true,
      data: asset,
    };
  }

  async updateAsset(id: number, updateAssetDto: UpdateAssetDto) {
    await this.findOneAsset(id);
    const updated = await this.prisma.itAsset.update({
      where: { id },
      data: {
        ...updateAssetDto,
        purchaseDate: updateAssetDto.purchaseDate
          ? new Date(updateAssetDto.purchaseDate)
          : undefined,
      },
    });
    return {
      success: true,
      message: `Data Aset ID #${id} berhasil diupdate!`,
      data: updated,
    };
  }

  // ==========================================
  // 2. ASSET HANDOVER (E-BAST Serah Terima)
  // ==========================================
  async createHandover(createHandoverDto: CreateHandoverDto, creatorId: number) {
    // Pastikan asetnya ada
    await this.findOneAsset(createHandoverDto.assetId);

    // 1. Catat Berita Acara
    const handover = await this.prisma.assetHandover.create({
      data: {
        handoverNumber: createHandoverDto.handoverNumber,
        assetId: createHandoverDto.assetId,
        userId: createHandoverDto.userId,
        handoverDate: new Date(createHandoverDto.handoverDate),
        notes: createHandoverDto.notes,
        status: 'ACTIVE',
        createdBy: creatorId,
      },
    });

    // 2. OTOMATISASI: Pindahkan status kepemilikan di tabel Aset!
    await this.prisma.itAsset.update({
      where: { id: createHandoverDto.assetId },
      data: {
        currentUserId: createHandoverDto.userId,
        status: 'IN_USE',
      },
    });

    return {
      success: true,
      message: 'Berita Acara Serah Terima berhasil dicatat! Status Aset otomatis di-update! 🤝',
      data: handover,
    };
  }

  async uploadHandoverEvidence(handoverId: number, file: Express.Multer.File) {
    const handover = await this.prisma.assetHandover.findUnique({
      where: { id: handoverId },
    });
    if (!handover) throw new NotFoundException('Data Handover tidak ditemukan!');

    const filePath = file ? file.path : null;

    const updated = await this.prisma.assetHandover.update({
      where: { id: handoverId },
      data: { evidenceFile: filePath },
    });

    return {
      success: true,
      message: 'File E-BAST berhasil diupload! 📄',
      data: updated,
    };
  }

  async returnAsset(handoverId: number) {
    const handover = await this.prisma.assetHandover.findUnique({
      where: { id: handoverId },
    });
    if (!handover) throw new NotFoundException('Data Handover tidak ditemukan!');

    // Tandai selesai dikembalikan
    await this.prisma.assetHandover.update({
      where: { id: handoverId },
      data: {
        status: 'RETURNED',
        returnDate: new Date(),
      },
    });

    // Kosongkan pemegang aset
    await this.prisma.itAsset.update({
      where: { id: handover.assetId },
      data: {
        currentUserId: null,
        status: 'AVAILABLE',
      },
    });

    return {
      success: true,
      message: 'Aset telah dikembalikan ke tim IT! Status aset kembali menjadi AVAILABLE.',
    };
  }
}
