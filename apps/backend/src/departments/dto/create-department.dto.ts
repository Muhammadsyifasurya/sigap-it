import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama Departemen gak boleh kosong, bre!' })
  name: string;
}
