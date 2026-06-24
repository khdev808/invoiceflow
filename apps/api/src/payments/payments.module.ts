import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PayPalService } from './paypal.service';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PayPalService],
  exports: [PaymentsService, PayPalService],
})
export class PaymentsModule {}
