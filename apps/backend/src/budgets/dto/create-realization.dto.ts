import { IsString, IsNotEmpty, IsInt, IsNumber, Min } from 'class-validator';

export class CreateRealizationDto {
  @IsInt()
  @IsNotEmpty()
  rkapBudgetId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(1, { message: 'Jumlah realisasi minimal 1 rupiah' })
  amount: number;

  @IsString()
  @IsNotEmpty()
  transactionDate: string; // YYYY-MM-DD
}
