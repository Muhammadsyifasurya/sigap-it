import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Nama tidak boleh kosong, bre!' })
  @IsString({ message: 'Nama harus berupa text!' })
  name: string;

  @IsNotEmpty({ message: 'Email jangan sampai kosong, ya!' })
  @IsEmail(
    {},
    { message: 'Format email-nya salah, bre! Contoh: user@lpp.co.id' },
  )
  email: string;

  @IsNotEmpty({ message: 'Password wajib diisi!' })
  @IsString()
  @MinLength(6, {
    message: 'Password minimal harus 6 karakter biar aman, bre!',
  })
  password: string;

  @IsNotEmpty({ message: 'Role ID harus ditentukan!' })
  @IsNumber(
    {},
    { message: 'Role ID harus berupa angka (ID dari tabel roles)!' },
  )
  roleId: number;

  @IsNotEmpty({ message: 'Department ID harus ditentukan!' })
  @IsNumber(
    {},
    {
      message: 'Department ID harus berupa angka (ID dari tabel departments)!',
    },
  )
  departmentId: number;
}
