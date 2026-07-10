import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

// File Filter Khusus PDF, JPG, PNG
export const imageAndPdfFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i)) {
    return callback(
      new BadRequestException('Woi hacker! Cuma boleh upload PDF, JPG, dan PNG ya! 🚨'),
      false,
    );
  }
  callback(null, true);
};

// File Filter Khusus PDF & Word (Untuk Modul SOP/Dokumen)
export const documentFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.originalname.match(/\.(pdf|doc|docx)$/i)) {
    return callback(
      new BadRequestException('Cuma boleh upload dokumen PDF atau Word! 📄'),
      false,
    );
  }
  callback(null, true);
};
