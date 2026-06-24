import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ExpensesModule } from './expenses/expenses.module';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { ProductsModule } from './products/products.module';
import { MileageModule } from './mileage/mileage.module';
import { OcrModule } from './ocr/ocr.module';
import { EmailModule } from './email/email.module';
import { PlanModule } from './plan/plan.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClientsModule,
    InvoicesModule,
    ExpensesModule,
    TimeEntriesModule,
    ReportsModule,
    NotificationsModule,
    PaymentsModule,
    AdminModule,
    UsersModule,
    JobsModule,
    ProductsModule,
    MileageModule,
    OcrModule,
    EmailModule,
    PlanModule,
    IntegrationsModule,
    UploadsModule,
  ],
})
export class AppModule {}
