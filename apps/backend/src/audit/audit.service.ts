import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFindingDto } from './dto/create-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) { }

  // ==========================================
  // 1. AUDIT FINDINGS (Temuan Induk)
  // ==========================================
  async createFinding(createFindingDto: CreateFindingDto) {
    const finding = await this.prisma.auditFinding.create({
      data: {
        ...createFindingDto,
        status: createFindingDto.status || 'OPEN',
      },
    });
    return {
      success: true,
      message: 'Temuan Audit berhasil dicatat! 🚨',
      data: finding,
    };
  }

  async findAll(page: string = '1', limit: string = '10') {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [findings, total] = await this.prisma.$transaction([
      this.prisma.auditFinding.findMany({
        skip,
        take: limitNum,
        include: {
          actionPlans: {
            include: { pic: { select: { name: true } } },
          },
        },
      }),
      this.prisma.auditFinding.count(),
    ]);

    return {
      success: true,
      data: findings,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOneFinding(id: number) {
    const finding = await this.prisma.auditFinding.findUnique({
      where: { id },
      include: { actionPlans: true },
    });
    if (!finding) throw new NotFoundException(`Temuan ID #${id} gak ada, bre!`);

    return {
      success: true,
      message: `Temuan ID #${id} berhasil ditarik!`,
      data: finding,
    };
  }

  async updateFinding(id: number, updateFindingDto: UpdateFindingDto) {
    await this.findOneFinding(id);
    const updated = await this.prisma.auditFinding.update({
      where: { id },
      data: updateFindingDto,
    });
    return {
      success: true,
      message: `Temuan ID #${id} berhasil diupdate!`,
      data: updated,
    };
  }

  // ==========================================
  // 2. AUDIT ACTION PLANS (Tindak Lanjut)
  // ==========================================
  async createActionPlan(createActionPlanDto: CreateActionPlanDto) {
    // Pastikan finding-nya ada
    await this.findOneFinding(createActionPlanDto.findingId);

    const actionPlan = await this.prisma.auditActionPlan.create({
      data: {
        findingId: createActionPlanDto.findingId,
        actionDescription: createActionPlanDto.actionDescription,
        picId: createActionPlanDto.picId,
        targetDate: new Date(createActionPlanDto.targetDate),
      },
    });

    // Update status temuan induk jadi IN_PROGRESS karena sudah ada Action Plan
    await this.prisma.auditFinding.update({
      where: { id: createActionPlanDto.findingId },
      data: { status: 'IN_PROGRESS' },
    });

    return {
      success: true,
      message: 'Tindak lanjut (Action Plan) berhasil ditugaskan! 🛠️',
      data: actionPlan,
    };
  }

  async uploadEvidence(actionPlanId: number, file: Express.Multer.File) {
    const actionPlan = await this.prisma.auditActionPlan.findUnique({
      where: { id: actionPlanId },
    });

    if (!actionPlan) throw new NotFoundException('Action Plan gak ketemu!');

    const filePath = file ? file.path : null;

    const updated = await this.prisma.auditActionPlan.update({
      where: { id: actionPlanId },
      data: {
        evidenceFile: filePath,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Bukti perbaikan berhasil diupload! Action Plan Selesai! ✅',
      data: updated,
    };
  }
}
