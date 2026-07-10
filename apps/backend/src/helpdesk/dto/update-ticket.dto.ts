import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  @IsOptional()
  assignedTo?: number;

  @IsInt()
  @IsOptional()
  downtimeMinutes?: number;

  @IsString()
  @IsOptional()
  rootCause?: string;

  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
