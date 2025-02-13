import { Injectable } from '@nestjs/common';
import { Quote } from './quote.entity';

@Injectable()
export class QuotesService {
  private quotes: Quote[] = [];

  async createQuote(quote: Quote): Promise<Quote> {
    quote.id = Date.now().toString();
    quote.createdAt = new Date();
    this.quotes.push(quote);
    return quote;
  }

  async getQuotes(): Promise<Quote[]> {
    return this.quotes;
  }

  async getQuoteById(id: string): Promise<Quote | undefined> {
    return this.quotes.find(quote => quote.id === id);
  }
}
