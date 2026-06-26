import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AppUserGuard } from '../auth/guards';

@Controller('reports')
@UseGuards(AppUserGuard)
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('income')
  income(
    @Request() req: { user: { userId: string } },
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reports.incomeReport(req.user.userId, from, to);
  }

  @Get('profit-loss')
  profitLoss(
    @Request() req: { user: { userId: string } },
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reports.profitLoss(req.user.userId, from, to);
  }
}
