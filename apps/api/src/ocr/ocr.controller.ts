import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  constructor(private ocr: OcrService) {}

  @Post('receipt')
  parseReceipt(
    @Request() req: { user: { userId: string } },
    @Body() body: { imageUri: string; vendor?: string; amount?: number; base64?: string; mimeType?: string },
  ) {
    return this.ocr.parseReceipt(req.user.userId, body.imageUri, body);
  }
}
