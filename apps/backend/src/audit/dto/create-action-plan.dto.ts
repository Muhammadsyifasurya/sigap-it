import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateActionPlanDto {
  @IsInt()
  @IsNotEmpty()
  findingId: number;

  @IsString()
  @IsNotEmpty()
  actionDescription: string;

  @IsInt()
  @IsNotEmpty()
  picId: number;

  @IsString()
  @IsNotEmpty()
  targetDate: string; // Format YYYY-MM-DD
}
