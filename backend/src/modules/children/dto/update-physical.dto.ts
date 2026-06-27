import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePhysicalDto {
  @ApiPropertyOptional() @IsOptional() @IsString() skinColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() eyeColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hairColor?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() heightCm?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() weightKg?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() build?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() specialMarks?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() scars?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() birthmarks?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() physicalObs?: string;
}
