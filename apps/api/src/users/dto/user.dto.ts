import { IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  businessLogo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  businessPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  businessEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  businessAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  timezone?: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsNumber()
  defaultTaxRate?: number;

  @IsOptional()
  @IsNumber()
  defaultPaymentTerms?: number;

  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @IsOptional()
  @IsString()
  estimatePrefix?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  enableOpenTracking?: boolean;

  @IsOptional()
  enablePaymentReminders?: boolean;

  @IsOptional()
  @IsNumber()
  reminderDaysBefore?: number;

  @IsOptional()
  @IsNumber()
  reminderDaysAfter?: number;

  @IsOptional()
  enableLateFees?: boolean;

  @IsOptional()
  @IsNumber()
  lateFeePercent?: number;

  @IsOptional()
  @IsString()
  pushToken?: string;

  @IsOptional()
  @IsString()
  webhookUrl?: string;
}
