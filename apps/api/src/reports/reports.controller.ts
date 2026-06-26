import { Controller, Get, Query, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
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

  @Get('export/quickbooks')
  async exportQuickBooks(
    @Request() req: { user: { userId: string } },
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Res() res: Response,
  ) {
    const data = await this.reports.exportQuickBooksCsv(req.user.userId, from, to);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${data.filename}"`);
    res.send(data.content);
  }
}
