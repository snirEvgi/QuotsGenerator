import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { Quote } from './quote.entity';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  async createQuote(@Body() quote: Quote): Promise<Quote> {
    return this.quotesService.createQuote(quote);
  }

  @Get()
  async getQuotes(): Promise<Quote[]> {
    return this.quotesService.getQuotes();
  }

  @Get(':id')
  async getQuoteById(@Param('id') id: string): Promise<Quote> {
    const quote = await this.quotesService.getQuoteById(id);
    if (!quote) {
      throw new NotFoundException(`Quote with ID "${id}" not found`);
    }
    return quote;
  }
}
