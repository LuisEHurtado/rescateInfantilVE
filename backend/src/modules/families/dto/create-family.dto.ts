import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FamilyVerifyStatus } from '@prisma/client';

export class CreateFamilyDto {
  @ApiProperty({ example: 'María Rodríguez' }) @IsString() fullName: string;
  @ApiProperty({ example: 'Madre' }) @IsString() relationship: string;
  @ApiPropertyOptional({ example: 'V-12345678' }) @IsOptional() @IsString() document?: string;
  @ApiPropertyOptional({ example: '+58-414-1234567' }) @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;
}

export class UpdateFamilyVerifyDto {
  @ApiProperty({ enum: FamilyVerifyStatus }) @IsEnum(FamilyVerifyStatus) verifyStatus: FamilyVerifyStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;
}
