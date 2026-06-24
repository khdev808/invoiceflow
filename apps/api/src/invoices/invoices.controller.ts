import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, ConvertEstimateDto, ClientSignDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards';

@Controller('invoices')
export class InvoicesController {
  constructor(private invoices: InvoicesService) {}

  @Get('public/:id')
  getPublic(@Param('id') id: string) {
    return this.invoices.findPublic(id);
  }

  @Patch('public/:id/view')
  markViewed(@Param('id') id: string) {
    return this.invoices.markViewed(id);
  }

  @Post('public/:id/sign')
  clientSign(@Param('id') id: string, @Body() dto: ClientSignDto) {
    return this.invoices.clientSign(id, dto.signature, dto.signerName);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recurring/list')
  listRecurring(@Request() req: { user: { userId: string } }) {
    return this.invoices.listRecurring(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('recurring/:id/toggle')
  toggleRecurring(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() body: { active: boolean },
  ) {
    return this.invoices.toggleRecurring(req.user.userId, id, body.active);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('recurring/:id')
  deleteRecurring(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.invoices.deleteRecurring(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  dashboard(@Request() req: { user: { userId: string } }) {
    return this.invoices.getDashboardStats(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Request() req: { user: { userId: string } },
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.invoices.findAll(req.user.userId, { status, type, clientId });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.invoices.findOne(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() dto: CreateInvoiceDto) {
    return this.invoices.create(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoices.update(req.user.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/send')
  send(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.invoices.send(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/convert')
  convert(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: ConvertEstimateDto,
  ) {
    return this.invoices.convertEstimate(req.user.userId, id, dto.dueDate);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/payments')
  recordPayment(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() body: { amount: number; method: string; transactionId?: string },
  ) {
    return this.invoices.recordPayment(req.user.userId, id, body.amount, body.method, body.transactionId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.invoices.remove(req.user.userId, id);
  }
}
