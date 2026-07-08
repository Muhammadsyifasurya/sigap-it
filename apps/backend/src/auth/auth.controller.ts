import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authModuleService: AuthService) {}

  @Post('login') // <-- Endpoint-nya jadi: POST http://localhost:4000/auth/login
  login(@Body() loginDto: LoginDto) {
    return this.authModuleService.login(loginDto);
  }
}
