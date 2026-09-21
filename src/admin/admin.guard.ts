import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token não fornecido.');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token);

      const permissions =
        typeof payload.permissions === 'string'
          ? JSON.parse(payload.permissions)
          : payload.permissions;

      if (
        !permissions ||
        !permissions.admin ||
        permissions.admin.access !== true
      ) {
        throw new ForbiddenException('Acesso negado. Apenas administradores.');
      }

      request['user'] = payload;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    return true;
  }
}
