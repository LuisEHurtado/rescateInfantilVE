import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'jperez' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  fullName: string;

  @ApiProperty({ enum: Role, example: Role.RESCUER })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({ example: 'jperez@proteccioncivil.gob.ve' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Protección Civil Caracas' })
  @IsOptional()
  @IsString()
  organization?: string;
}
