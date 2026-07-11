import { Controller, Get, Put, Body } from '@nestjs/common';
import { AnnouncementService } from './announcement.service';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Get('active')
  getActiveAnnouncement() {
    return this.announcementService.getActiveAnnouncement();
  }

  @Put()
  upsertAnnouncement(@Body() data: { title: string; message: string; isActive: boolean }) {
    return this.announcementService.upsertAnnouncement(data);
  }
}
