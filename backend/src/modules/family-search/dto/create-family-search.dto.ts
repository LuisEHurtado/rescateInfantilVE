import { IsString, IsOptional, IsEnum, IsInt, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sex } from '@prisma/client';

export class CreateFamilySearchDto {
  @ApiProperty() @IsString() contactName: string;
  @ApiProperty() @IsString() contactPhone: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactWhatsapp?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactEmail?: string;
  @ApiProperty() @IsString() relationship: string;

  @ApiPropertyOptional() @IsOptional() @IsString() childName?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(Sex) childSex?: Sex;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(18) childAgeMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(18) childAgeMax?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() childState?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() childMunicipality?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() skinColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hairColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() eyeColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() specialMarks?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString() lastSeenAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastSeenPlace?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() circumstances?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;
}
