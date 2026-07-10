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
  Request,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreateRealizationDto } from './dto/create-realization.dto';
import { AuthGuard } from '../auth/auth.guard';
import { imageAndPdfFilter } from '../utils/file-upload.util';

@UseGuards(AuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  // --- MASTER ANGGARAN ---
  @Post()
  createBudget(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.createBudget(createBudgetDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.budgetsService.findAll(page, limit);
  }

  @Get(':id')
  findOneBudget(@Param('id') id: string) {
    return this.budgetsService.findOneBudget(+id);
  }

  @Patch(':id')
  updateBudget(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.updateBudget(+id, updateBudgetDto);
  }

  // --- REALISASI ---
  @Post('realizations')
  createRealization(@Body() createRealizationDto: CreateRealizationDto, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const inputById = req.user.sub as number; // Siapa yang nginput tagihan
    return this.budgetsService.createRealization(createRealizationDto, inputById);
  }

  @Patch('realizations/:id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `invoice-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: imageAndPdfFilter,
    }),
  )
  uploadRealizationEvidence(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.budgetsService.uploadRealizationEvidence(+id, file);
  }
}
