import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuotesModule } from './quotes/quotes.module';
import { Quote } from './quotes/quote.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'quotes_db',
      entities: [Quote],
      synchronize: true, // Set to false in production
    }),
    QuotesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
