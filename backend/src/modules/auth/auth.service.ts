import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { CreateEmergencyTokenDto } from './dto/create-emergency-token.dto';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (!user || !user.isActive) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.jwtService.sign({ sub: user.id, username: user.username });
    return {
      access_token: token,
      user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
    };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, fullName: true, role: true, email: true, organization: true },
    });
  }

  async createEmergencyToken(dto: CreateEmergencyTokenDto, adminId: string) {
    const token = randomBytes(32).toString('hex');
    return this.prisma.emergencyToken.create({
      data: {
        token,
        description: dto.description,
        createdById: adminId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  async listEmergencyTokens() {
    return this.prisma.emergencyToken.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async revokeEmergencyToken(id: string) {
    return this.prisma.emergencyToken.update({ where: { id }, data: { isActive: false } });
  }

  async validateEmergencyToken(token: string): Promise<boolean> {
    const record = await this.prisma.emergencyToken.findUnique({ where: { token } });
    if (!record || !record.isActive) return false;
    if (record.expiresAt && record.expiresAt < new Date()) return false;
    await this.prisma.emergencyToken.update({
      where: { id: record.id },
      data: { usageCount: { increment: 1 } },
    });
    return true;
  }
}
