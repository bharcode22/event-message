import { Module } from '@nestjs/common';
import { RabbitmqListenerService } from './rabbitmq-listener.service';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';
import { RabbitmqConnectionService, RabbitmqGlobalConnectionService  } from './rabbitmq.connection';

@Module({
  controllers: [],
  imports: [
    TelegramBotModule
  ], 
  providers: [
    RabbitmqListenerService, 
    RabbitmqConnectionService, 
    RabbitmqGlobalConnectionService
  ],
})
export class RabbitmqListenerModule {}
