import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class LineItemDto {
  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;
}

export class CreateInvoiceDto {
  @IsString()
  clientId: string;

  @IsOptional()
  @IsEnum(['INVOICE', 'ESTIMATE', 'CREDIT_NOTE', 'RECURRING'])
  documentType?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsString()
  signature?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  recurringRule?: string;

  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @IsOptional()
  @IsNumber()
  depositPercent?: number;

  @IsOptional()
  @IsString()
  linkedInvoiceId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems: LineItemDto[];
}

export class UpdateInvoiceDto extends CreateInvoiceDto {
  @IsOptional()
  @IsEnum(['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED'])
  status?: string;
}

export class ConvertEstimateDto {
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class ClientSignDto {
  @IsString()
  signature: string;

  @IsOptional()
  @IsString()
  signerName?: string;
}

export class CreateRecurringDto {
  @IsString()
  clientId: string;

  @IsString()
  frequency: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems: LineItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
