import { Injectable, BadRequestException } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'receipts');

  async saveReceiptBase64(userId: string, base64: string, mimeType = 'image/jpeg'): Promise<string> {
    if (!base64?.trim()) throw new BadRequestException('Image data required');

    const raw = base64.includes(',') ? base64.split(',')[1] : base64;
    const buffer = Buffer.from(raw, 'base64');
    if (buffer.length > 8 * 1024 * 1024) throw new BadRequestException('Image too large (max 8MB)');

    await mkdir(this.uploadDir, { recursive: true });
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';
    const filename = `${userId}-${randomUUID()}.${ext}`;
    await writeFile(join(this.uploadDir, filename), buffer);
    return `/uploads/receipts/${filename}`;
  }
}
