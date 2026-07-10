import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateHandoverDto {
  @IsString()
  @IsNotEmpty()
  handoverNumber: string;

  @IsInt()
  @IsNotEmpty()
  assetId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number; // User penerima

  @IsString()
  @IsNotEmpty()
  handoverDate: string; // YYYY-MM-DD

  @IsString()
  @IsOptional()
  notes?: string;
}
