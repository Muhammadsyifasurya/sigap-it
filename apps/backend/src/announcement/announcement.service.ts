import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementService {
  constructor(private prisma: PrismaService) {}

  async getActiveAnnouncement() {
    return this.prisma.announcement.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async upsertAnnouncement(data: { title: string; message: string; isActive: boolean }) {
    // We only need one active announcement, so we can just update the first one or create if none exists.
    const existing = await this.prisma.announcement.findFirst();

    if (existing) {
      return this.prisma.announcement.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          message: data.message,
          isActive: data.isActive,
        },
      });
    } else {
      return this.prisma.announcement.create({
        data: {
          title: data.title,
          message: data.message,
          isActive: data.isActive,
        },
      });
    }
  }
}
