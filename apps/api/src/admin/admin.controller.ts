import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { SecurityService } from '../security/security.service';
import { JwtAuthGuard, AdminGuard } from '../auth/guards';
import { UpdatePlanDto, AdminUsersQueryDto } from './dto/admin.dto';
import { CreateSecurityBlockDto, BlockUserDto } from './dto/security.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private admin: AdminService,
    private security: SecurityService,
  ) {}

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

  @Get('security/events')
  securityEvents(@Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number) {
    return this.security.listEvents(limit);
  }

  @Get('security/blocks')
  securityBlocks() {
    return this.security.listBlocks();
  }

  @Post('security/blocks')
  createBlock(
    @Req() req: { user: { userId: string } },
    @Body() body: CreateSecurityBlockDto,
  ) {
    return this.security.createBlock({
      blockType: body.blockType,
      value: body.blockType === 'email' ? body.value.toLowerCase() : body.value,
      scope: body.scope,
      reason: body.reason,
      hours: body.hours,
      createdBy: req.user.userId,
    });
  }

  @Delete('security/blocks/:id')
  removeBlock(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.security.removeBlock(id, req.user.userId);
  }

  @Patch('users/:id/block')
  blockUser(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() body: BlockUserDto,
  ) {
    return this.admin.blockUser(req.user.userId, id, body);
  }

  @Patch('users/:id/unblock')
  unblockUser(@Req() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.admin.unblockUser(req.user.userId, id);
  }
}
