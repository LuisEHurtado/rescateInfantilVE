import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

class UploadPhotoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

@ApiTags('photos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('children/:childId/photos')
export class PhotosController {
  constructor(private service: PhotosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar fotos del expediente' })
  findAll(@Param('childId') childId: string) {
    return this.service.findAll(childId);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Subir foto' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage() }))
  upload(
    @Param('childId') childId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadPhotoDto,
    @CurrentUser() user: any,
    @Request() req: any,
  ) {
    if (!file) throw new BadRequestException('No se recibió ninguna imagen');
    if (!ALLOWED_TYPES.includes(file.mimetype))
      throw new BadRequestException('Formato no permitido. Solo JPG, PNG, WEBP o HEIC');
    if (file.size > MAX_SIZE_BYTES)
      throw new BadRequestException('La imagen no puede superar 10 MB');

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'desconocida';
    return this.service.upload(childId, file, dto.description || '', user?.id ?? null, ip as string);
  }

  @Patch(':photoId/main')
  @ApiOperation({ summary: 'Establecer como foto principal' })
  setMain(@Param('childId') childId: string, @Param('photoId') photoId: string) {
    return this.service.setMain(childId, photoId);
  }

  @Delete(':photoId')
  @ApiOperation({ summary: 'Eliminar foto' })
  remove(@Param('childId') childId: string, @Param('photoId') photoId: string) {
    return this.service.remove(childId, photoId);
  }
}
