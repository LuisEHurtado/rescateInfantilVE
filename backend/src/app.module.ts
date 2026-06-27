import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ChildrenModule } from './modules/children/children.module';
import { PhotosModule } from './modules/photos/photos.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { MedicalModule } from './modules/medical/medical.module';
import { FamiliesModule } from './modules/families/families.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { VisitsModule } from './modules/visits/visits.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      name: 'global',
      ttl: 60000,
      limit: 60,
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ChildrenModule,
    PhotosModule,
    TransfersModule,
    MedicalModule,
    FamiliesModule,
    TimelineModule,
    AuditModule,
    NotificationsModule,
    SearchModule,
    DashboardModule,
    ReportsModule,
    VisitsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
