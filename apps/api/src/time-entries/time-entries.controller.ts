import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('time-entries')
@UseGuards(JwtAuthGuard)
export class TimeEntriesController {
  constructor(private timeEntries: TimeEntriesService) {}

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
