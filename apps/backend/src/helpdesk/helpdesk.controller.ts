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
} from '@nestjs/common';
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
  createTicket(@Body() createTicketDto: CreateTicketDto, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const reportedById = req.user.sub as number;
    return this.helpdeskService.createTicket(createTicketDto, reportedById);
  }

  // 2. Daftar semua tiket (Untuk Dashboard Admin/IT)
  @Get('tickets')
  findAllTickets(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.helpdeskService.findAllTickets(page, limit);
  }

  @Get('tickets/:id')
  findOneTicket(@Param('id') id: string) {
    return this.helpdeskService.findOneTicket(+id);
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
