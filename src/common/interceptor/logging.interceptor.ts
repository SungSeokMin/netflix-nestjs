/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// 민감 필드 제거 유틸
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'cardNumber',
];

function sanitize(obj: Record<string, any>): Record<string, any> {
  if (!obj) return obj;
  const sanitized = { ...obj };
  SENSITIVE_FIELDS.forEach((field) => {
    if (sanitized[field]) sanitized[field] = '***';
  });
  return sanitized;
}

const SLOW_REQUEST_THRESHOLD_MS = 1000; // 1초 이상이면 warn

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const requestId = uuidv4(); // 요청 추적용 ID
    const { method, url, ip, body } = req;
    const userId = req.user?.sub ?? 'anonymous';
    const startTime = Date.now();

    // 요청 로그
    this.logger.info('Request', {
      requestId,
      method,
      url,
      ip,
      userId,
      body: sanitize(body),
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;

          // 느린 API 감지
          if (duration > SLOW_REQUEST_THRESHOLD_MS) {
            this.logger.warn('Slow API Detected', {
              requestId,
              method,
              url,
              duration: `${duration}ms`,
            });
          }

          this.logger.info('Response', {
            requestId, // 요청-응답 매칭 가능
            method,
            url,
            userId,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
          });
        },
        error: (error: unknown) => {
          const statusCode =
            error instanceof HttpException ? error.getStatus() : 500;

          const message =
            error instanceof HttpException
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Internal Server Error';

          this.logger.error('Response Error', {
            requestId,
            method,
            url,
            userId,
            statusCode,
            duration: `${Date.now() - startTime}ms`,
            error: message,
            stack: error instanceof Error ? error.stack : undefined,
          });
        },
      }),
    );
  }
}
