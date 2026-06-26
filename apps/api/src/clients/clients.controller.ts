import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { AppUserGuard } from '../auth/guards';

@Controller('clients')
@UseGuards(AppUserGuard)
export class ClientsController {
  constructor(private clients: ClientsService) {}

  @Get()
  findAll(@Request() req: { user: { userId: string } }, @Query('search') search?: string) {
    return this.clients.findAll(req.user.userId, search);
  }

  @Get(':id')
  findOne(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.clients.findOne(req.user.userId, id);
  }

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() dto: CreateClientDto) {
    return this.clients.create(req.user.userId, dto);
  }

  @Put(':id')
  update(
    @Request() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clients.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.clients.remove(req.user.userId, id);
  }
}
