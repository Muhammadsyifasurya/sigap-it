import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama Jabatan gak boleh kosong, bre!' })
  name: string;
}
