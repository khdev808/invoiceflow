import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('link/:invoiceId')
  createLink(@Param('invoiceId') invoiceId: string) {
    return this.payments.createPaymentLink(invoiceId);
  }
}
