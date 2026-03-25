import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

export const QueryRunner = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: Request = context.switchToHttp().getRequest();

    if (!req || !req.queryRunner) {
      throw new InternalServerErrorException('QueryRunner를 찾을 수 없습니다.');
    }

    return req.queryRunner;
  },
);
