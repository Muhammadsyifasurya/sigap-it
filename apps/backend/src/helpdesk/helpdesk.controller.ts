import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HelpdeskService } from './helpdesk.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('helpdesk')
export class HelpdeskController {
  constructor(private readonly helpdeskService: HelpdeskService) {}

  // 1. Karyawan bikin tiket
  @Post('tickets')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `ticket-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  createTicket(
    @Body() createTicketDto: CreateTicketDto, 
    @Request() req: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const reportedById = req.user.sub as number;
    if (file) {
      createTicketDto.attachmentUrl = `/uploads/${file.filename}`;
    }
    return this.helpdeskService.createTicket(createTicketDto, reportedById);
  }

  // 2. Daftar semua tiket (Untuk Dashboard Admin/IT & Karyawan)
  @Get('tickets')
  findAllTickets(@Query('page') page?: string, @Query('limit') limit?: string, @Request() req?: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.helpdeskService.findAllTickets(page, limit, req.user);
  }

  @Get('tickets/:id')
  findOneTicket(@Param('id') id: string) {
    return this.helpdeskService.findOneTicket(+id);
  }

  // 2.5 Tambah Komentar Tiket
  @Post('tickets/:id/comments')
  addComment(
    @Param('id') id: string,
    @Body('message') message: string,
    @Request() req: any
  ) {
    const userId = req.user.sub as number;
    return this.helpdeskService.addComment(+id, userId, message);
  }

  // 3. Staf IT mengambil (Assign) tiket ke dirinya sendiri
  @Patch('tickets/:id/assign')
  assignTicket(@Param('id') id: string, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const assigneeId = req.user.sub as number;
    return this.helpdeskService.assignTicket(+id, assigneeId);
  }

  // 4. Staf IT menyelesaikan (Resolve) tiket
  @Patch('tickets/:id/resolve')
  resolveTicket(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.helpdeskService.resolveTicket(+id, updateTicketDto);
  }
}
