import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class HelpdeskService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. PEMBUATAN TIKET OLEH USER
  // ==========================================
  async createTicket(createTicketDto: CreateTicketDto, reportedById: number) {
    const ticket = await this.prisma.helpdeskTicket.create({
      data: {
        ...createTicketDto,
        reportedBy: reportedById,
        status: 'OPEN',
      },
    });
    return {
      success: true,
      message: 'Tiket berhasil dibuat! Tim IT akan segera menindaklanjuti. 🚀',
      data: ticket,
    };
  }

  // ==========================================
  // 1.5. TAMBAH KOMENTAR
  // ==========================================
  async addComment(ticketId: number, userId: number, message: string) {
    const comment = await this.prisma.ticketComment.create({
      data: {
        ticketId,
        userId,
        message,
      },
      include: {
        user: { select: { name: true, roleId: true } }
      }
    });
    return {
      success: true,
      message: 'Komentar berhasil dikirim!',
      data: comment,
    };
  }

  // ==========================================
  // 2. DAFTAR TIKET (UNTUK DASHBOARD)
  // ==========================================
  async findAllTickets(page: string = '1', limit: string = '10', user?: any) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    // Filter by Role (Jika Role == 3 / Karyawan Biasa, cuma bisa lihat tiket sendiri)
    const whereClause = (user && user.roleId === 3) 
      ? { reportedBy: user.sub } 
      : {};

    const [tickets, total] = await this.prisma.$transaction([
      this.prisma.helpdeskTicket.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        include: {
          reporter: { select: { name: true, email: true, department: { select: { name: true } } } },
          assignee: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.helpdeskTicket.count({ where: whereClause }),
    ]);

    return {
      success: true,
      data: tickets,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOneTicket(id: number) {
    const ticket = await this.prisma.helpdeskTicket.findUnique({
      where: { id },
      include: {
        reporter: { select: { name: true, email: true, department: { select: { name: true } } } },
        assignee: { select: { name: true } },
        comments: {
          include: {
            user: { select: { name: true, roleId: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
    });
    if (!ticket) throw new NotFoundException(`Tiket #${id} gak ketemu!`);
    return {
      success: true,
      data: ticket,
    };
  }

  // ==========================================
  // 3. STAF IT MENGAMBIL TIKET (ASSIGN)
  // ==========================================
  async assignTicket(id: number, assigneeId: number) {
    await this.findOneTicket(id);
    const updated = await this.prisma.helpdeskTicket.update({
      where: { id },
      data: {
        assignedTo: assigneeId,
        status: 'IN_PROGRESS',
      },
    });
    return {
      success: true,
      message: 'Tiket telah diambil olehmu! Status berubah jadi IN_PROGRESS. 💪',
      data: updated,
    };
  }

  // ==========================================
  // 4. PENYELESAIAN TIKET (RESOLVE)
  // ==========================================
  async resolveTicket(id: number, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.prisma.helpdeskTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Tiket #${id} gak ketemu!`);

    // Validasi khusus kalau tipe tiketnya INCIDENT
    if (ticket.ticketType === 'INCIDENT') {
      if (!updateTicketDto.downtimeMinutes || !updateTicketDto.rootCause) {
        throw new BadRequestException('Karena ini INCIDENT berat, wajib ngisi downtimeMinutes dan rootCause ya!');
      }
    }

    const resolved = await this.prisma.helpdeskTicket.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolutionNotes: updateTicketDto.resolutionNotes,
        downtimeMinutes: updateTicketDto.downtimeMinutes,
        rootCause: updateTicketDto.rootCause,
      },
    });

    return {
      success: true,
      message: 'MANTAP! Tiket berhasil diselesaikan (RESOLVED). ✅',
      data: resolved,
    };
  }
}
