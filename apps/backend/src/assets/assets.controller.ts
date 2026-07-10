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
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { CreateHandoverDto } from './dto/create-handover.dto';
import { AuthGuard } from '../auth/auth.guard';
import { imageAndPdfFilter } from '../utils/file-upload.util';

@UseGuards(AuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // --- MASTER ASSETS ---
  @Post()
  createAsset(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.createAsset(createAssetDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.assetsService.findAll(page, limit);
  }

  @Get(':id')
  findOneAsset(@Param('id') id: string) {
    return this.assetsService.findOneAsset(+id);
  }

  @Patch(':id')
  updateAsset(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    return this.assetsService.updateAsset(+id, updateAssetDto);
  }

  // --- HANDOVERS (Serah Terima) ---
  @Post('handovers')
  createHandover(@Body() createHandoverDto: CreateHandoverDto, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const creatorId = req.user.sub as number; // Ambil ID user yang login
    return this.assetsService.createHandover(createHandoverDto, creatorId);
  }

  @Patch('handovers/:id/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `bast-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: imageAndPdfFilter,
    }),
  )
  uploadHandoverEvidence(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.assetsService.uploadHandoverEvidence(+id, file);
  }

  @Patch('handovers/:id/return')
  returnAsset(@Param('id') id: string) {
    return this.assetsService.returnAsset(+id);
  }
}
