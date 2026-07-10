import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuditService } from './audit.service';
import { CreateFindingDto } from './dto/create-finding.dto';
import { UpdateFindingDto } from './dto/update-finding.dto';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { AuthGuard } from '../auth/auth.guard';
import { imageAndPdfFilter } from '../utils/file-upload.util';

@UseGuards(AuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // --- Temuan Induk ---
  @Post('findings')
  createFinding(@Body() createFindingDto: CreateFindingDto) {
    return this.auditService.createFinding(createFindingDto);
  }

  @Get('findings')
  findAllFindings(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.auditService.findAll(page, limit);
  }

  @Get('findings/:id')
  findOneFinding(@Param('id') id: string) {
    return this.auditService.findOneFinding(+id);
  }

  @Patch('findings/:id')
  updateFinding(
    @Param('id') id: string,
    @Body() updateFindingDto: UpdateFindingDto,
  ) {
    return this.auditService.updateFinding(+id, updateFindingDto);
  }

  // --- Action Plan ---
  @Post('action-plans')
  createActionPlan(@Body() createActionPlanDto: CreateActionPlanDto) {
    return this.auditService.createActionPlan(createActionPlanDto);
  }

  // --- Upload Bukti Penyelesaian ---
  @Patch('action-plans/:id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `audit-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: imageAndPdfFilter,
    }),
  )
  uploadEvidence(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.auditService.uploadEvidence(+id, file);
  }
}
