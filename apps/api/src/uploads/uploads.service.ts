import { Injectable, BadRequestException } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const MAX_BASE64_LEN = 2_000_000;

@Injectable()
export class UploadsService {
  private readonly uploadDir = join(process.cwd(), 'uploads');
  private readonly isProd = process.env.NODE_ENV === 'production';

  async saveBase64(base64: string, mimeType = 'image/jpeg', prefix = 'file') {
    const match = base64.match(/^data:([^;]+);base64,(.+)$/);
    const data = match ? match[2] : base64;
    const mime = match ? match[1] : mimeType;

    if (!data || data.length > MAX_BASE64_LEN) {
      throw new BadRequestException('Invalid or oversized file (max ~1.5 MB)');
    }

    // Production: persist as data URL in the database (Render filesystem is ephemeral)
    if (this.isProd) {
      const dataUrl = match ? base64 : `data:${mime};base64,${data}`;
      return { url: dataUrl, filename: `${prefix}-inline` };
    }

    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('pdf') ? 'pdf' : 'jpg';
    await mkdir(this.uploadDir, { recursive: true });
    const filename = `${prefix}-${randomUUID()}.${ext}`;
    await writeFile(join(this.uploadDir, filename), Buffer.from(data, 'base64'));
    return { url: `/uploads/${filename}`, filename };
  }
}
