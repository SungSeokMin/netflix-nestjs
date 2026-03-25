import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

export const UserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req: Request = context.switchToHttp().getRequest();

    if (!req || !req.user || !req.user.sub) {
      throw new UnauthorizedException('사용자 정보를 찾을 수 없습니다.');
    }

    return req.user.sub;
  },
);
