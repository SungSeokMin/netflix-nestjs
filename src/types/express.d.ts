import { Payload } from 'src/auth/middleware/bearer-token.middleware';

declare module 'express' {
  interface Request {
    user?: Payload;
  }
}
