import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('documents') // Ini berarti endpoint URL-nya nanti: localhost:4000/documents
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async create(@Body() createDocumentDto: CreateDocumentDto) {
    return await this.documentsService.create(createDocumentDto);
  }

  @Get()
  async findAll() {
    return await this.documentsService.findAll();
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
