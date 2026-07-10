import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreateRealizationDto } from './dto/create-realization.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) { }

  // ==========================================
  // 1. MASTER ANGGARAN (RKAP BUDGET)
  // ==========================================
  async createBudget(createBudgetDto: CreateBudgetDto) {
    const budget = await this.prisma.rkapBudget.create({
      data: {
        year: createBudgetDto.year,
        code: createBudgetDto.code,
        name: createBudgetDto.name,
        type: createBudgetDto.type,
        // Di awal pembuatan, SISA = PAGU
        allocatedAmount: createBudgetDto.allocatedAmount,
        remainingAmount: createBudgetDto.allocatedAmount,
      },
    });
    return {
      success: true,
      message: 'Master Anggaran baru berhasil dicatat! 💰',
      data: budget,
    };
  }


  async findAll(page: string = '1', limit: string = '10') {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [budgets, total] = await this.prisma.$transaction([
      this.prisma.rkapBudget.findMany({
        skip,
        take: limitNum,
        include: {
          realizations: true,
        },
      }),
      this.prisma.rkapBudget.count(),
    ]);

    return {
      success: true,
      data: budgets,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOneBudget(id: number) {
    const budget = await this.prisma.rkapBudget.findUnique({
      where: { id },
      include: { realizations: true },
    });
    if (!budget) throw new NotFoundException(`Budget ID #${id} tidak ditemukan!`);
    return {
      success: true,
      data: budget,
    };
  }

  async updateBudget(id: number, updateBudgetDto: UpdateBudgetDto) {
    await this.findOneBudget(id);
    const updated = await this.prisma.rkapBudget.update({
      where: { id },
      data: updateBudgetDto,
    });
    return {
      success: true,
      message: `Budget ID #${id} berhasil diupdate!`,
      data: updated,
    };
  }

  // ==========================================
  // 2. REALISASI ANGGARAN (PENGELUARAN)
  // ==========================================
  async createRealization(createRealizationDto: CreateRealizationDto, inputById: number) {
    const budget = await this.prisma.rkapBudget.findUnique({
      where: { id: createRealizationDto.rkapBudgetId },
    });

    if (!budget) throw new NotFoundException('Master Anggaran tidak ditemukan!');

    // LOGIKA ANTI-OVERBUDGET
    // Decimal.js di Prisma harus dikonversi ke Number (atau parseFloat) buat dicheck
    const sisaAnggaran = Number(budget.remainingAmount);
    if (createRealizationDto.amount > sisaAnggaran) {
      throw new BadRequestException(
        `OVERBUDGET ALERT! Sisa anggaran untuk ${budget.code} tinggal ${sisaAnggaran}, tapi kamu mau pakai ${createRealizationDto.amount}!`,
      );
    }

    // 1. Simpan bukti transaksi
    const realization = await this.prisma.rkapRealization.create({
      data: {
        rkapBudgetId: createRealizationDto.rkapBudgetId,
        description: createRealizationDto.description,
        amount: createRealizationDto.amount,
        transactionDate: new Date(createRealizationDto.transactionDate),
        inputBy: inputById,
      },
    });

    // 2. Potong Sisa Anggaran (remainingAmount) di tabel Master Budget
    // Prisma punya operator decrement otomatis lho!
    await this.prisma.rkapBudget.update({
      where: { id: createRealizationDto.rkapBudgetId },
      data: {
        remainingAmount: {
          decrement: createRealizationDto.amount,
        },
      },
    });

    return {
      success: true,
      message: 'Realisasi anggaran berhasil dicatat! Sisa anggaran telah dipotong otomatis. 📉',
      data: realization,
    };
  }

  async uploadRealizationEvidence(realizationId: number, file: Express.Multer.File) {
    const realization = await this.prisma.rkapRealization.findUnique({
      where: { id: realizationId },
    });
    if (!realization) throw new NotFoundException('Data Realisasi tidak ditemukan!');

    const filePath = file ? file.path : null;

    const updated = await this.prisma.rkapRealization.update({
      where: { id: realizationId },
      data: { evidenceFile: filePath },
    });

    return {
      success: true,
      message: 'Bukti Kuitansi/Faktur berhasil diupload! 🧾',
      data: updated,
    };
  }
}
