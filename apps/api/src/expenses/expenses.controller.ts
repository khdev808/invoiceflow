import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { AppUserGuard } from '../auth/guards';

@Controller('expenses')
@UseGuards(AppUserGuard)
export class ExpensesController {
  constructor(private expenses: ExpensesService) {}

  @Get('summary')
  summary(
    @Request() req: { user: { userId: string } },
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.expenses.getSummary(req.user.userId, from, to);
  }

  @Get()
  findAll(
    @Request() req: { user: { userId: string } },
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.expenses.findAll(req.user.userId, from, to);
  }

  @Get(':id')
  findOne(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.expenses.findOne(req.user.userId, id);
  }

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() body: any) {
    return this.expenses.create(req.user.userId, body);
  }

  @Put(':id')
  update(@Request() req: { user: { userId: string } }, @Param('id') id: string, @Body() body: any) {
    return this.expenses.update(req.user.userId, id, body);
  }

  @Delete(':id')
  remove(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.expenses.remove(req.user.userId, id);
  }
}
