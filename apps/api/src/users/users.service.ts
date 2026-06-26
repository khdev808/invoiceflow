import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, UpdateSettingsDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(userId: string, data: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        businessLogo: true,
        businessPhone: true,
        businessEmail: true,
        businessAddress: true,
        taxId: true,
        currency: true,
        language: true,
        timezone: true,
      },
    });
  }

  async updateSettings(userId: string, data: UpdateSettingsDto) {
    return this.prisma.userSettings.update({
      where: { userId },
      data,
    });
  }
}
