import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, AdminGuard } from '../auth/guards';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.getDashboard();
  }

  @Get('users')
  users(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.admin.getUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    );
  }

  @Patch('users/:id/plan')
  updatePlan(@Param('id') id: string, @Body() body: { plan: string }) {
    return this.admin.updateUserPlan(id, body.plan);
  }
}
