import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { envVariables } from 'src/common/const/env.const';
import { Role } from 'src/user/entity/user.entity';

export type Payload = { sub: number; role: Role; type: string };

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] as string;

    if (!authHeader) {
      next();
      return;
    }

    try {
      const token = this.validateBearerToken(authHeader);

      const decodedPayload = this.jwtService.decode<Payload>(token);

      if (
        decodedPayload.type !== 'refresh' &&
        decodedPayload.type !== 'access'
      ) {
        throw new BadRequestException('잘못된 토큰입니다.');
      }

      const secretKey =
        decodedPayload.type === 'refresh'
          ? envVariables.refreshTokenSecret
          : envVariables.accessTokenSecret;

      const payload = await this.jwtService.verifyAsync<Payload>(token, {
        secret: this.configService.get<string>(secretKey),
      });

      req.user = payload;
      next();
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료됐습니다.');
      }

      next();
    }
  }

  validateBearerToken(rawToken: string) {
    const bearerSplit = rawToken.split(' ');

    if (bearerSplit.length != 2) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
    }

    const [bearer, token] = bearerSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 타입이 잘못됐습니다.');
    }

    return token;
  }
}
