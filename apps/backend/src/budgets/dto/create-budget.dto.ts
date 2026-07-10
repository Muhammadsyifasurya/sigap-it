import { IsString, IsNotEmpty, IsInt, IsNumber, IsIn, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsInt()
  @IsNotEmpty()
  year: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['CAPEX', 'OPEX'], { message: 'Tipe anggaran hanya boleh CAPEX atau OPEX' })
  type: string;

  @IsNumber()
  @Min(0, { message: 'Pagu anggaran tidak boleh minus' })
  allocatedAmount: number;
}
