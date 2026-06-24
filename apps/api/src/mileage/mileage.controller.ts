import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MileageService } from './mileage.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('mileage')
@UseGuards(JwtAuthGuard)
export class MileageController {
  constructor(private mileage: MileageService) {}

  @Get('summary')
  summary(@Request() req: { user: { userId: string } }) {
    return this.mileage.getSummary(req.user.userId);
  }

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.mileage.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() body: any) {
    return this.mileage.create(req.user.userId, body);
  }

  @Delete(':id')
  remove(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.mileage.remove(req.user.userId, id);
  }
}
