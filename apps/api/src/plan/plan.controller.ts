import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
}
