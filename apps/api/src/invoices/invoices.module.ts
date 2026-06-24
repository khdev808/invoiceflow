import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { EmailModule } from '../email/email.module';
import { PlanModule } from '../plan/plan.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [EmailModule, PlanModule, IntegrationsModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
