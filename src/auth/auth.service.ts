import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { SignInDTO } from '../dtos/auth';
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

    const accessToken = await this.jwtService.sign({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      accessToken,
    };
  }
}
