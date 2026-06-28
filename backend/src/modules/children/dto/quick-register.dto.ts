import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sex } from '@prisma/client';
import { Type } from 'class-transformer';

export class QuickRegisterDto {
  // === Token de emergencia ===
  @ApiPropertyOptional({ description: 'Token de acceso de emergencia' })
  @IsOptional()
  @IsString()
  emergencyToken?: string;

  // === Quién reporta ===
  @ApiPropertyOptional({ example: 'Carlos Rodríguez' })
  @IsOptional()
  @IsString()
  rescuerName?: string;

  @ApiPropertyOptional({ example: '04121234567' })
  @IsOptional()
  @IsString()
  rescuerPhone?: string;

  @ApiPropertyOptional({ example: 'V-12345678' })
  @IsOptional()
  @IsString()
  rescuerCedula?: string;

  @ApiPropertyOptional({ example: '04121234567' })
  @IsOptional()
  @IsString()
  rescuerWhatsapp?: string;

  @ApiPropertyOptional({ example: 'Protección Civil' })
  @IsOptional()
  @IsString()
  rescueOrg?: string;

  @ApiPropertyOptional({ example: 'RESCUER', enum: ['RESCUER', 'FAMILY', 'VOLUNTEER'] })
  @IsOptional()
  @IsString()
  reporterType?: string;

  // === Datos del niño/niña ===
  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'García' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'V-28000000' })
  @IsOptional()
  @IsString()
  cedula?: string;

  @ApiProperty({ enum: Sex, example: Sex.MALE })
  @IsEnum(Sex)
  sex: Sex;

  @ApiProperty({ example: 7 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(18)
  approximateAge: number;

  @ApiPropertyOptional({ example: '2018-05-15' })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'HOSPITALIZED' })
  @IsOptional()
  @IsString()
  caseStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observations?: string;

  // === Lugar de hallazgo ===
  @ApiProperty({ example: 'Miranda' })
  @IsString()
  state: string;

  @ApiProperty({ example: 'Sucre' })
  @IsString()
  municipality: string;

  @ApiPropertyOptional({ example: 'Petare' })
  @IsOptional()
  @IsString()
  parish?: string;

  @ApiProperty({ example: 'Sector La Esperanza, Petare, Caracas' })
  @IsString()
  foundAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gpsLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  gpsLng?: number;

  // === Destino ===
  @ApiProperty({ example: 'Hospital Central de Caracas' })
  @IsString()
  destinationHospital: string;

  // === Contacto 1 ===
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact1Name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact1Relationship?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact1Phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact1Whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact1PhoneHome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact1Cedula?: string;

  // === Contacto 2 ===
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact2Name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact2Relationship?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact2Phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact2Whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact2PhoneHome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact2Cedula?: string;

  // === Contacto 3 ===
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact3Name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact3Relationship?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact3Phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact3Whatsapp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact3PhoneHome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact3Cedula?: string;

  // === Metadata de registro (enviada por el frontend) ===
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientGps?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientFingerprint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientScreen?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientTimezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientPlatform?: string;
}
