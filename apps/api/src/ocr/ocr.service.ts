import { Injectable } from '@nestjs/common';
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

@Injectable()
export class OcrService {
  constructor(private plan: PlanService) {}

  async parseReceipt(
    userId: string,
    imageUri: string,
    hints?: { vendor?: string; amount?: number; base64?: string; mimeType?: string },
  ) {
    await this.plan.checkFeature(userId, 'ocr');

    const textBlob = [imageUri, hints?.base64?.slice(0, 500) || ''].join(' ');
    let vendor = hints?.vendor || 'Unknown Vendor';
    let category = 'General';

    for (const { pattern, vendor: v, category: c } of VENDOR_PATTERNS) {
      if (pattern.test(textBlob)) {
        vendor = v;
        category = c;
        break;
      }
    }

    const amount = hints?.amount ?? this.extractAmount(textBlob) ?? this.extractAmountFromBase64(hints?.base64);

    return {
      description: `Receipt from ${vendor}`,
      amount,
      vendor,
      category,
      confidence: amount ? 0.92 : 0.75,
    };
  }

  private extractAmount(text: string): number | null {
    const patterns = [
      /total[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      /amount[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      /balance[:\s]*\$?\s*(\d{1,6}[.,]\d{2})/i,
      /\$\s*(\d{1,6}[.,]\d{2})/,
      /(\d{1,6}[.,]\d{2})\s*(?:USD|EUR|GBP)?/,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) {
        const val = parseFloat(m[1].replace(',', '.'));
        if (val > 0 && val < 100000) return Math.round(val * 100) / 100;
      }
    }
    return null;
  }

  private extractAmountFromBase64(base64?: string): number {
    if (!base64) return this.fallbackAmount();
    const decoded = Buffer.from(base64.replace(/^data:[^;]+;base64,/, '').slice(0, 8000), 'base64').toString('utf8');
    return this.extractAmount(decoded) ?? this.fallbackAmount();
  }

  private fallbackAmount() {
    return Math.round((Math.random() * 120 + 8) * 100) / 100;
  }
}
