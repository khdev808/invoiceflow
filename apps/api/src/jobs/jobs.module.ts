import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsService } from './jobs.service';
import { InvoicesModule } from '../invoices/invoices.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ScheduleModule.forRoot(), InvoicesModule, EmailModule],
  providers: [JobsService],
})
export class JobsModule {}
