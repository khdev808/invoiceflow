import { Injectable, BadRequestException } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  async saveBase64(base64: string, mimeType = 'image/jpeg', prefix = 'file') {
    const match = base64.match(/^data:([^;]+);base64,(.+)$/);
    const data = match ? match[2] : base64;
    const mime = match ? match[1] : mimeType;

    if (!data || data.length > 8_000_000) {
      throw new BadRequestException('Invalid or oversized file');
    }

    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('pdf') ? 'pdf' : 'jpg';
    await mkdir(this.uploadDir, { recursive: true });
    const filename = `${prefix}-${randomUUID()}.${ext}`;
    await writeFile(join(this.uploadDir, filename), Buffer.from(data, 'base64'));
    return { url: `/uploads/${filename}`, filename };
  }
}
