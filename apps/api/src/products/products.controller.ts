import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AppUserGuard } from '../auth/guards';

@Controller('products')
@UseGuards(AppUserGuard)
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  findAll(@Request() req: { user: { userId: string } }, @Query('search') search?: string) {
    return this.products.findAll(req.user.userId, search);
  }

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() body: any) {
    return this.products.create(req.user.userId, body);
  }

  @Put(':id')
  update(@Request() req: { user: { userId: string } }, @Param('id') id: string, @Body() body: any) {
    return this.products.update(req.user.userId, id, body);
  }

  @Delete(':id')
  remove(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.products.remove(req.user.userId, id);
  }
}
