import { Controller, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AppUserGuard } from '../auth/guards';
import { UpdateProfileDto, UpdateSettingsDto } from './dto/user.dto';

@Controller('users')
@UseGuards(AppUserGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Put('profile')
  updateProfile(@Request() req: { user: { userId: string } }, @Body() body: UpdateProfileDto) {
    return this.users.updateProfile(req.user.userId, body);
  }

  @Put('push-token')
  updatePushToken(@Request() req: { user: { userId: string } }, @Body() body: { token: string }) {
    return this.users.updateSettings(req.user.userId, { pushToken: body.token });
  }

  @Put('settings')
  updateSettings(@Request() req: { user: { userId: string } }, @Body() body: UpdateSettingsDto) {
    return this.users.updateSettings(req.user.userId, body);
  }
}
