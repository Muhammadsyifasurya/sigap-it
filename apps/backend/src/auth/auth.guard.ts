import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtPayload {
  sub: number;
  name: string;
  email: string;
  roleId: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. KUNCI DI SINI: Kasih tahu generic type-nya biar gak jadi 'any' bawaan pabrik!
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Lu gak punya akses ke rute ini, kirim token lu dulu, bre!',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: 'RAHASIA_NEGARA_SIGAP_IT_2026',
      });

      // 2. Karena udah dikunci di atas, sekarang kita bisa nulis pake dot (.) biasa tanpa bracket string!
      request.user = payload;
    } catch {
      throw new UnauthorizedException(
        'Token lu palsu atau udah expired, bre! Silakan login ulang.',
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
