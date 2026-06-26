import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AuthModule } from '../auth/auth.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [AuthModule, SecurityModule],
  controllers: [AdminController, AdminAuthController],
  providers: [AdminService, AdminAuthService],
})
export class AdminModule {}
