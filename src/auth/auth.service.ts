import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { SignInDTO, UpdatePasswordDTO } from '../dtos/auth';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signin(data: SignInDTO) {
    const user = await this.prismaService.users.findUnique({
      where: { username: data.username },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const passwordMatch = await bcrypt.compare(
      data.password,
      user.password_hash,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    let sessionId: string | null = null;

    if (data.machineInfo) {
      const existingSession = await this.prismaService.user_sessions.findUnique(
        {
          where: { mac_address: data.machineInfo.mac_address },
        },
      );

      if (!existingSession) {
        await this.prismaService.user_sessions.create({
          data: {
            user_id: user.id,
            hostname: data.machineInfo.hostname,
            os_platform: data.machineInfo.os_platform,
            mac_address: data.machineInfo.mac_address,
            ip_address: data.machineInfo.ip_address,
            app_version: data.machineInfo.app_version,
            is_online: false,
            last_seen: new Date(),
          },
        });
        throw new UnauthorizedException(
          'Máquina não reconhecida. Aguardando aprovação do administrador.',
        );
      }

      if (!existingSession.is_approved) {
        throw new UnauthorizedException(
          'Esta máquina ainda aguarda aprovação do administrador.',
        );
      }

      const session = await this.prismaService.user_sessions.update({
        where: { mac_address: data.machineInfo.mac_address },
        data: {
          user_id: user.id,
          hostname: data.machineInfo.hostname,
          os_platform: data.machineInfo.os_platform,
          ip_address: data.machineInfo.ip_address,
          app_version: data.machineInfo.app_version,
          is_online: true,
          last_seen: new Date(),
        },
      });
      sessionId = session.id;
    }

    const accessToken = await this.jwtService.sign({
      id: user.id,
      username: user.username,
      permissions: user.permissions,
      sessionId,
    });

    return {
      id: user.id,
      username: user.username,
      permissions: user.permissions,
      sessionId,
      accessToken,
    };
  }

  async logoutSession(sessionId: string) {
    if (!sessionId) return;
    await this.prismaService.user_sessions.updateMany({
      where: { id: sessionId },
      data: { is_online: false, last_seen: new Date() },
    });
  }

  async updatePassword(data: UpdatePasswordDTO) {
    const user = await this.prismaService.users.findUnique({
      where: { username: data.username },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const passwordMatch = await bcrypt.compare(
      data.oldPassword,
      user.password_hash,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(data.newPassword, saltRounds);

    await this.prismaService.users.update({
      where: { id: user.id },
      data: { password_hash: newPasswordHash },
    });

    return { message: 'Senha atualizada com sucesso' };
  }
}
