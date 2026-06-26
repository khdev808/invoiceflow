import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { AppUserGuard } from '../auth/guards';

@Controller('referrals')
@UseGuards(AppUserGuard)
export class ReferralsController {
  constructor(private referrals: ReferralsService) {}

  @Get('me')
  me(@Request() req: { user: { userId: string } }) {
    return this.referrals.getStats(req.user.userId);
  }
}
