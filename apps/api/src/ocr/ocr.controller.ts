import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  constructor(private ocr: OcrService) {}

  @Post('receipt')
  parseReceipt(@Body() body: { imageUri: string; vendor?: string; amount?: number }) {
    return this.ocr.parseReceipt(body.imageUri, body);
  }
}
