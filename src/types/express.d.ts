import { Payload } from 'src/auth/middleware/bearer-token.middleware';
import { QueryRunner } from 'typeorm';

declare module 'express' {
  interface Request {
    queryRunner: QueryRunner;
    user?: Payload;
  }
}
