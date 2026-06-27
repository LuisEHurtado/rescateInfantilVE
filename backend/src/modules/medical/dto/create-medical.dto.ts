import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMedicalDto {
  @ApiProperty() @IsString() hospital: string;
  @ApiProperty() @IsDateString() admittedAt: string;
  @ApiPropertyOptional() @IsOptional() @IsString() diagnosis?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() healthStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() doctor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() treatment?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dischargedAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;
}
