import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RBAC } from '../decorator/rbac.decorator';
import { Role } from 'src/user/entity/user.entity';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private readonly relfector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const role = this.relfector.get<Role>(RBAC, context.getHandler());

    if (!Object.values(Role).includes(role)) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    return user.role <= role;
  }
}
