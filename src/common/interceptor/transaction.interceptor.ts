import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { from, lastValueFrom, Observable } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor<
  unknown,
  unknown
> {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Promise<Observable<unknown>> {
    const req: Request = context.switchToHttp().getRequest();

    const qr = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    req.queryRunner = qr;

    return from(
      (async (): Promise<unknown> => {
        try {
          const response = await lastValueFrom(next.handle());
          await qr.commitTransaction();
          return response;
        } catch (e) {
          if (qr.isTransactionActive) {
            await qr.rollbackTransaction();
          }
          throw e;
        } finally {
          await qr.release();
        }
      })(),
    );
  }
}
