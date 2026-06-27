import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ example: 'Hospital Central de Caracas' })
  @IsString()
  origin: string;

  @ApiProperty({ example: 'Hospital Militar de Caracas' })
  @IsString()
  destination: string;

  @ApiProperty({ example: '2024-03-12T15:30:00Z' })
  @IsDateString()
  departedAt: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString() arrivedAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional({ example: 'Ambulancia' }) @IsOptional() @IsString() transport?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() responsible?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;

  // Actualiza la ubicación actual automáticamente
  @ApiPropertyOptional() @IsOptional() @IsString() destinationArea?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() destinationBed?: string;
}
