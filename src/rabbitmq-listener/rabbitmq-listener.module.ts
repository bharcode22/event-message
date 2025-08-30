import { Module } from '@nestjs/common';
import { RabbitmqListenerService } from './rabbitmq-listener.service';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [
    TelegramBotModule
  ], 
  controllers: [],
  providers: [
    RabbitmqListenerService
  ],
})
export class RabbitmqListenerModule {}
