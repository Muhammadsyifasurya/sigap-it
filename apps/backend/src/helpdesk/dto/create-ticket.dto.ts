import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  ticketNumber: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['INCIDENT', 'SERVICE_REQUEST'], { message: 'Tipe tiket hanya boleh INCIDENT atau SERVICE_REQUEST' })
  ticketType: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['HIGH', 'MEDIUM', 'LOW'])
  priority: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}
