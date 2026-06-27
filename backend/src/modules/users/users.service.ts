import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { username: dto.username } });
    if (existing) throw new ConflictException('El nombre de usuario ya existe');

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash,
        fullName: dto.fullName,
        role: dto.role,
        email: dto.email,
        organization: dto.organization,
      },
      select: { id: true, username: true, fullName: true, role: true, email: true, organization: true, isActive: true, createdAt: true },
    });
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, username: true, fullName: true, role: true, email: true, organization: true, isActive: true, createdAt: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, fullName: true, role: true, email: true, organization: true, isActive: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, username: true, fullName: true, role: true, email: true, organization: true, isActive: true },
    });
  }

  async toggleActive(id: string) {
    const user = await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, username: true, isActive: true },
    });
  }

  async resetPassword(id: string, newPassword: string) {
    await this.findOne(id);
    const passwordHash = await argon2.hash(newPassword);
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash },
      select: { id: true, username: true },
    });
  }
}
