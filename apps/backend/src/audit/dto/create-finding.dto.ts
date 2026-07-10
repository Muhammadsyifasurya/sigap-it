import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFindingDto {
  @IsString()
  @IsNotEmpty({ message: 'Kode temuan gak boleh kosong!' })
  findingCode: string;

  @IsString()
  @IsNotEmpty({ message: 'Judul temuan wajib diisi!' })
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  auditorName: string;

  @IsString()
  @IsNotEmpty()
  riskLevel: string; // HIGH, MEDIUM, LOW

  @IsString()
  @IsOptional()
  status?: string = 'OPEN';
}
