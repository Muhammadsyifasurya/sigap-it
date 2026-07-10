import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  contractNumber: string;

  @IsString()
  @IsNotEmpty()
  contractStart: string; // YYYY-MM-DD

  @IsString()
  @IsNotEmpty()
  contractEnd: string; // YYYY-MM-DD

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  slaPercentage?: number;
}
