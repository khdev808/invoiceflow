import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoicePdfService } from './invoice-pdf.service';
import { EmailModule } from '../email/email.module';
import { PlanModule } from '../plan/plan.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { ShareModule } from '../share/share.module';

@Module({
  imports: [EmailModule, PlanModule, IntegrationsModule, NotificationsModule, ShareModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicePdfService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
