import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
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
  ) {
    return this.service.upload(childId, file, dto.description || '', user?.id ?? null);
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
