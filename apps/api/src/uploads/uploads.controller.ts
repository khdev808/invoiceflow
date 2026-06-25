import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards';
import { PrismaService } from '../prisma/prisma.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(
    private uploads: UploadsService,
    private prisma: PrismaService,
  ) {}

  @Post('receipt')
  async receipt(
    @Request() req: { user: { userId: string } },
    @Body() body: { base64: string; mimeType?: string },
  ) {
    return this.uploads.saveBase64(body.base64, body.mimeType, 'receipt');
  }

  @Post('logo')
  async logo(
    @Request() req: { user: { userId: string } },
    @Body() body: { base64: string; mimeType?: string },
  ) {
    const { url } = await this.uploads.saveBase64(body.base64, body.mimeType, 'logo');
    await this.prisma.user.update({
      where: { id: req.user.userId },
      data: { businessLogo: url },
    });
    return { url };
  }
}
