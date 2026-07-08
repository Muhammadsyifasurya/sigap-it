import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  docNumber!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  currentVersion?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
