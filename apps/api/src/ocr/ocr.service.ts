import { Injectable } from '@nestjs/common';

@Injectable()
export class OcrService {
  /** Mock OCR — extracts plausible values from filename hints or returns defaults for demo */
  async parseReceipt(imageUri: string, hints?: { vendor?: string; amount?: number }) {
    const vendorMatch = imageUri.match(/homdepot|shell|walmart|costco/i);
    const vendor = hints?.vendor || (vendorMatch ? vendorMatch[0] : 'Unknown Vendor');

    return {
      description: `Receipt from ${vendor}`,
      amount: hints?.amount ?? this.randomAmount(),
      vendor,
      category: this.guessCategory(vendor),
      confidence: 0.85,
    };
  }

  private randomAmount() {
    return Math.round((Math.random() * 150 + 10) * 100) / 100;
  }

  private guessCategory(vendor: string) {
    const v = vendor.toLowerCase();
    if (v.includes('shell') || v.includes('fuel')) return 'Travel';
    if (v.includes('depot') || v.includes('lowes')) return 'Materials';
    return 'General';
  }
}
