import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async updateMachineStatus(macAddress: string, status: boolean | null) {
    this.logger.log(
      `Atualizando status da máquina MAC ${macAddress} para: ${status}`,
    );
    return this.prisma.user_sessions.update({
      where: { mac_address: macAddress },
      data: { is_approved: status },
    });
  }

  async getAllUsers() {
    return this.prisma.users.findMany({
      select: {
        id: true,
        username: true,
        created_at: true,
        permissions: true,
        user_sessions: {
          orderBy: { last_seen: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async createUser(data: any) {
    this.logger.log(`Criando novo usuário: ${data.username}`);

    const hash = await bcrypt.hash(data.password, 10);
    return this.prisma.users.create({
      data: {
        username: data.username,
        password_hash: hash,
        permissions: data.permissions || [],
      },
    });
  }

  async updateUser(id: string, data: any) {
    this.logger.log(`Atualizando dados do usuário ID: ${id}`);

    const updateData: any = {};
    if (data.username) {
      updateData.username = data.username;
    }
    if (data.password && data.password.trim() !== '') {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
    }
    if (data.permissions) {
      updateData.permissions = data.permissions;
    }

    return this.prisma.users.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteUser(id: string) {
    this.logger.warn(`Deletando usuário e suas sessões. ID do Usuário: ${id}`);

    await this.prisma.user_sessions
      .deleteMany({
        where: { user_id: id },
      })
      .catch(() => {});

    return this.prisma.users.delete({
      where: { id },
    });
  }
}
