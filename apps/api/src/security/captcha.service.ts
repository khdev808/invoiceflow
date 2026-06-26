import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type TurnstileResponse = {
  success: boolean;
  'error-codes'?: string[];
};

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);

  constructor(private config: ConfigService) {}

  isRequired(): boolean {
    const secret = this.config.get<string>('TURNSTILE_SECRET_KEY');
    return Boolean(secret && !secret.includes('placeholder'));
  }

  async verify(token: string | undefined, ip: string): Promise<void> {
    const secret = this.config.get<string>('TURNSTILE_SECRET_KEY');
    if (!secret || secret.includes('placeholder')) {
      if (process.env.NODE_ENV === 'production') {
        throw new BadRequestException('Human verification is not configured. Set TURNSTILE_SECRET_KEY.');
      }
      return;
    }

    if (!token) {
      throw new BadRequestException('Human verification is required. Complete the security check.');
    }

    const body = new URLSearchParams({
      secret,
      response: token,
      remoteip: ip,
    });

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = (await res.json()) as TurnstileResponse;
    if (!data.success) {
      this.logger.warn(`Turnstile failed: ${(data['error-codes'] || []).join(', ')}`);
      throw new BadRequestException('Human verification failed. Please try again.');
    }
  }
}
