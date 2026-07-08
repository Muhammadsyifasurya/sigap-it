import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email login jangan dikosongin, bre!' })
  @IsEmail({}, { message: 'Format email salah!' })
  email: string;

  @IsNotEmpty({ message: 'Password wajib diisi buat login!' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter!' })
  password: string;
}
