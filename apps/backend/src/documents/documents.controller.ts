import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path'; // <--- 1. AMAN! Sekarang extname gak bakal kena eror 'not found'
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AuthGuard } from '../auth/auth.guard';
import { documentFilter } from '../utils/file-upload.util';

@UseGuards(AuthGuard)
@Controller('documents') // Ini berarti endpoint URL-nya nanti: localhost:4000/documents
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  // 1. PASANG INTERCEPTOR DI SINI BUAT CONFIG STORAGE UPLOAD FILE
  @UseInterceptors(
    FileInterceptor('file', {
      // 2. JINAKKAN ESLINT TEPAT DI BARIS UNTUK PROPERTY STORAGE 🤫
      storage: diskStorage({
        destination: './uploads', // File fisik bakal tersimpan aman di folder ini
        filename: (req, file, callback) => {
          // Rakit nama file unik biar anti bentrok: doc-timestamp-random.pdf
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `doc-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: documentFilter,
    }),
  )
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File, // 2. TANGKAP FILE NYA DI SINI
  ) {
    // 3. OPER DATA DTO DAN FILE KE SERVICE NYA
    return await this.documentsService.create(createDocumentDto, file);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.documentsService.findAll(page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.documentsService.findOne(+id); // <--- Tanda '+' mengubah string ke number
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return await this.documentsService.update(+id, updateDocumentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.documentsService.remove(+id);
  }
}
