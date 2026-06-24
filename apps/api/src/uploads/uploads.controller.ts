import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  @Post('receipt')
  async uploadReceipt(
    @Request() req: { user: { userId: string } },
    @Body() body: { base64: string; mimeType?: string },
  ) {
    const url = await this.uploads.saveReceiptBase64(req.user.userId, body.base64, body.mimeType);
    return { url };
  }
}
