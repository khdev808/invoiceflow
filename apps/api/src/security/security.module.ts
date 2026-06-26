import { Module } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { SecurityService } from './security.service';

@Module({
  providers: [CaptchaService, SecurityService],
  exports: [CaptchaService, SecurityService],
})
export class SecurityModule {}
