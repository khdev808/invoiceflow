import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PlanService } from './plan.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('plan')
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private plan: PlanService) {}

  @Get('usage')
  usage(@Request() req: { user: { userId: string } }) {
    return this.plan.getUsage(req.user.userId);
  }

  @Post('upgrade')
  upgrade(
    @Request() req: { user: { userId: string } },
    @Body() body: { plan: 'pro' | 'business' },
  ) {
    return this.plan.upgradePlan(req.user.userId, body.plan);
  }
}
