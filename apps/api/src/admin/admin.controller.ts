import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, AdminGuard } from '../auth/guards';
import { UpdatePlanDto, AdminUsersQueryDto } from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.getDashboard();
  }

  @Get('users')
  users(@Query() query: AdminUsersQueryDto) {
    return this.admin.getUsers(query.page ?? 1, query.limit ?? 20, query.search);
  }

  @Get('audit-logs')
  auditLogs(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.admin.getAuditLogs(limit);
  }

  @Patch('users/:id/plan')
  updatePlan(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() body: UpdatePlanDto,
  ) {
    return this.admin.updateUserPlan(req.user.userId, id, body.plan);
  }
}
