import { Controller, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Put('profile')
  updateProfile(@Request() req: { user: { userId: string } }, @Body() body: any) {
    return this.users.updateProfile(req.user.userId, body);
  }

  @Put('settings')
  updateSettings(@Request() req: { user: { userId: string } }, @Body() body: any) {
    return this.users.updateSettings(req.user.userId, body);
  }
}
