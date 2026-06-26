import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any): any {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}

/** Rejects admin tokens and ADMIN role — user app API only */
@Injectable()
export class AppUserGuard extends JwtAuthGuard {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, user: any): any {
    const u = super.handleRequest(err, user);
    if (u.role === 'ADMIN' || u.aud === 'admin') {
      throw new ForbiddenException('Admin accounts cannot access the user application API');
    }
    return u;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (req.user?.aud !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    const user = await this.prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || user.role !== 'ADMIN' || user.isBlocked) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
