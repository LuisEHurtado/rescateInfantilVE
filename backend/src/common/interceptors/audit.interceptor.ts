import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap(async () => {
        if (!user || method === 'GET') return;
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action: method,
              entityType: url.split('/')[3] || 'unknown',
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            },
          });
        } catch (_) {}
      }),
    );
  }
}
