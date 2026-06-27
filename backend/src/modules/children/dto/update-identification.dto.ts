import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Sex, IdentityStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateIdentificationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() secondName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nickname?: string;
  @ApiPropertyOptional({ enum: Sex }) @IsOptional() @IsEnum(Sex) sex?: Sex;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(18) approximateAge?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() birthDateEst?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nationality?: string;
  @ApiPropertyOptional({ enum: IdentityStatus }) @IsOptional() @IsEnum(IdentityStatus) identityStatus?: IdentityStatus;
}
