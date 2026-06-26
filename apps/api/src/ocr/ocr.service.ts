import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlanService } from '../plan/plan.service';

const VENDOR_PATTERNS: { pattern: RegExp; vendor: string; category: string }[] = [
  { pattern: /walmart|wal-?mart/i, vendor: 'Walmart', category: 'General' },
  { pattern: /costco/i, vendor: 'Costco', category: 'General' },
  { pattern: /target/i, vendor: 'Target', category: 'General' },
  { pattern: /amazon/i, vendor: 'Amazon', category: 'Materials' },
  { pattern: /home\s?depot|homedepot/i, vendor: 'Home Depot', category: 'Materials' },
  { pattern: /lowes|lowe'?s/i, vendor: "Lowe's", category: 'Materials' },
  { pattern: /shell/i, vendor: 'Shell', category: 'Travel' },
  { pattern: /chevron/i, vendor: 'Chevron', category: 'Travel' },
  { pattern: /exxon|mobil/i, vendor: 'Exxon', category: 'Travel' },
  { pattern: /bp\s|bp$/i, vendor: 'BP', category: 'Travel' },
  { pattern: /starbucks/i, vendor: 'Starbucks', category: 'Meals' },
  { pattern: /mcdonald/i, vendor: "McDonald's", category: 'Meals' },
  { pattern: /uber|lyft/i, vendor: 'Rideshare', category: 'Travel' },
  { pattern: /staples|office\s?depot/i, vendor: 'Office Supplies', category: 'Office' },
];

type VisionResponse = {
  responses?: Array<{
    fullTextAnnotation?: { text?: string };
    textAnnotations?: Array<{ description?: string }>;
  }>;
};

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(
    private plan: PlanService,
    private config: ConfigService,
  ) {}

  async parseReceipt(
    userId: string,
    imageUri: string,
    hints?: { vendor?: string; amount?: number; base64?: string; mimeType?: string },
  ) {
    await this.plan.checkFeature(userId, 'ocr');

    const rawBase64 = hints?.base64?.replace(/^data:[^;]+;base64,/, '') || '';
    let ocrText = '';

    if (rawBase64) {
      ocrText = await this.extractTextWithVision(rawBase64);
    }

    const textBlob = [ocrText, imageUri, hints?.vendor || ''].join('\n');
    let vendor = hints?.vendor || this.matchVendor(textBlob) || 'Unknown Vendor';
    let category = 'General';

    for (const { pattern, vendor: v, category: c } of VENDOR_PATTERNS) {
      if (pattern.test(textBlob)) {
        vendor = v;
        category = c;
        break;
      }
    }

    const amount = hints?.amount ?? this.extractAmount(textBlob);
    const confidence = ocrText ? (amount ? 0.94 : 0.78) : amount ? 0.85 : 0.5;

    return {
      description: `Receipt from ${vendor}`,
      amount: amount ?? 0,
      vendor,
      category,
      confidence,
      requiresManualAmount: !amount,
      rawTextPreview: ocrText ? ocrText.slice(0, 200) : undefined,
    };
  }

  private async extractTextWithVision(base64: string): Promise<string> {
    const apiKey = this.config.get<string>('GOOGLE_VISION_API_KEY');
    if (!apiKey || apiKey.includes('placeholder')) {
      return this.decodeBase64Text(base64);
    }

    try {
      const res = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
              },
            ],
          }),
        },
      );

      if (!res.ok) {
        this.logger.warn(`Vision API HTTP ${res.status}`);
        return this.decodeBase64Text(base64);
      }

      const data = (await res.json()) as VisionResponse;
      const text =
        data.responses?.[0]?.fullTextAnnotation?.text ||
        data.responses?.[0]?.textAnnotations?.[0]?.description ||
        '';
      return text;
    } catch (err) {
      this.logger.warn(`Vision API error: ${err instanceof Error ? err.message : err}`);
      return this.decodeBase64Text(base64);
    }
  }

  private decodeBase64Text(base64: string): string {
    try {
      return Buffer.from(base64.slice(0, 12000), 'base64').toString('utf8');
    } catch {
      return '';
    }
  }

  private matchVendor(text: string): string | null {
    for (const { pattern, vendor } of VENDOR_PATTERNS) {
      if (pattern.test(text)) return vendor;
    }
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    return lines[0]?.slice(0, 40) || null;
  }

  private extractAmount(text: string): number | null {
    const patterns = [
      /(?:grand\s*)?total[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      /amount\s*due[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      /balance[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      /subtotal[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      /\$\s*(\d{1,6}[.,]\d{2})/g,
      /(\d{1,6}[.,]\d{2})\s*(?:USD|EUR|GBP)/i,
    ];

    const candidates: number[] = [];
    for (const p of patterns) {
      if (p.global) {
        let m: RegExpExecArray | null;
        while ((m = p.exec(text)) !== null) {
          const val = parseFloat(m[1].replace(',', '.'));
          if (val > 0 && val < 100000) candidates.push(Math.round(val * 100) / 100);
        }
      } else {
        const m = text.match(p);
        if (m) {
          const val = parseFloat(m[1].replace(',', '.'));
          if (val > 0 && val < 100000) candidates.push(Math.round(val * 100) / 100);
        }
      }
    }

    if (!candidates.length) return null;
    return Math.max(...candidates);
  }
}
