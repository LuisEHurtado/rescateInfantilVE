import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { TimelineEventType } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp');
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PhotosService {
  constructor(
    private prisma: PrismaService,
    private timeline: TimelineService,
  ) {}

  async upload(childId: string, file: Express.Multer.File, description: string, userId: string | null) {
    const child = await this.prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw new NotFoundException('Expediente no encontrado');

    const uploadDir = join(process.cwd(), 'uploads', 'photos');
    const thumbDir = join(process.cwd(), 'uploads', 'thumbnails');
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
    if (!existsSync(thumbDir)) mkdirSync(thumbDir, { recursive: true });

    const filename = `${uuidv4()}.webp`;
    const thumbname = `thumb_${filename}`;

    // Compress and convert to webp
    await sharp(file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(uploadDir, filename));

    await sharp(file.buffer)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 70 })
      .toFile(join(thumbDir, thumbname));

    const isFirst = !(await this.prisma.photo.count({ where: { childId } }));

    const photo = await this.prisma.photo.create({
      data: {
        childId,
        url: `/uploads/photos/${filename}`,
        thumbnailUrl: `/uploads/thumbnails/${thumbname}`,
        isMain: isFirst,
        description,
        uploadedById: userId || null,
      },
    });

    await this.timeline.addEvent({
      childId,
      eventType: TimelineEventType.PHOTO_ADDED,
      description: `Fotografía agregada${description ? ': ' + description : ''}`,
      userId: userId || null,
    });

    return photo;
  }

  async findAll(childId: string) {
    return this.prisma.photo.findMany({
      where: { childId },
      orderBy: [{ isMain: 'desc' }, { uploadedAt: 'desc' }],
    });
  }

  async setMain(childId: string, photoId: string) {
    await this.prisma.photo.updateMany({ where: { childId }, data: { isMain: false } });
    return this.prisma.photo.update({ where: { id: photoId }, data: { isMain: true } });
  }

  async remove(childId: string, photoId: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo || photo.childId !== childId) throw new NotFoundException('Foto no encontrada');
    return this.prisma.photo.delete({ where: { id: photoId } });
  }
}
