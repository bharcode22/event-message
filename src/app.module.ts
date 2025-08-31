import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { RabbitmqListenerModule } from './rabbitmq-listener/rabbitmq-listener.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [],
  providers: [
    AppService
  ],
  imports: [
    TelegramBotModule,
    RabbitmqListenerModule, 
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
