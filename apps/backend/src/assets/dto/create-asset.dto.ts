import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  assetTag: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  hardwareTier?: string;

  @IsString()
  @IsOptional()
  purchaseDate?: string; // Format YYYY-MM-DD
}
