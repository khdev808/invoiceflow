import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { TimeEntriesService } from './time-entries.service';
import { AppUserGuard } from '../auth/guards';

@Controller('time-entries')
@UseGuards(AppUserGuard)
export class TimeEntriesController {
  constructor(private timeEntries: TimeEntriesService) {}

  @Get('export/ics')
  async exportIcs(@Request() req: { user: { userId: string } }, @Res() res: Response) {
    const entries = await this.timeEntries.findAll(req.user.userId);
    const ics = this.timeEntries.toIcs(entries);
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="invoiceflow-time.ics"');
    res.send(ics);
  }

  @Get()
  findAll(
    @Request() req: { user: { userId: string } },
    @Query('billable') billable?: string,
  ) {
    return this.timeEntries.findAll(req.user.userId, billable === 'true');
  }

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() body: any) {
    return this.timeEntries.create(req.user.userId, body);
  }

  @Post('to-line-items')
  toLineItems(@Request() req: { user: { userId: string } }, @Body() body: { entryIds: string[] }) {
    return this.timeEntries.toLineItems(req.user.userId, body.entryIds);
  }

  @Delete(':id')
  remove(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.timeEntries.remove(req.user.userId, id);
  }
}
