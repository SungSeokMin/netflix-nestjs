import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] as string;

    if (!authHeader) {
      next();
      return;
    }

    const token = this.validateBearerToken(authHeader);

    const blockedToken = await this.cacheManager.get(`BLOCK_TOKEN_${token}`);
    console.log('🎯 [bearer-token.middleware.ts:37]', blockedToken);
    if (blockedToken) {
      throw new UnauthorizedException('차단된 토큰입니다.');
    }

    const tokenKey = `TOKEN_${token}`;

    const cachedPayload = await this.cacheManager.get(tokenKey);

    if (cachedPayload) {
      req.user = cachedPayload as Payload;
      return next();
    }

    const decodedPayload = this.jwtService.decode<Payload>(token);

    if (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access') {
      throw new BadRequestException('잘못된 토큰입니다.');
    }

    try {
      const secretKey =
        decodedPayload.type === 'refresh'
          ? envVariables.refreshTokenSecret
          : envVariables.accessTokenSecret;

      const payload = await this.jwtService.verifyAsync<Payload>(token, {
        secret: this.configService.get<string>(secretKey),
      });

      const expiryDate = +new Date(payload['exp'] * 1000);
      const now = +Date.now();

      const differenceInseconds = (expiryDate - now) / 1000;

      await this.cacheManager.set(
        tokenKey,
        payload,
        Math.max((differenceInseconds - 30) * 1000, 1),
      );

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
