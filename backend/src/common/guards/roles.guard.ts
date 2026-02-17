import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../auth/entities/user.entity';

export const Roles = Reflector.createDecorator<UserRole[]>();

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get(Roles, context.getHandler());
        if (!requiredRoles) {
            return true; // No se especificaron roles, permitir acceso
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new ForbiddenException('No hay usuario autenticado');
        }

        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            throw new ForbiddenException(`Se requiere uno de los roles: ${requiredRoles.join(', ')}`);
        }

        return true;
    }
}
