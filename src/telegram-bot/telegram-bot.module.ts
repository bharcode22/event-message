import { Module } from '@nestjs/common';
import { TelegramBotServiceAdmin, TelegramBotServicePod } from './telegram-bot.service';

@Module({
  controllers: [],
  providers: [
    TelegramBotServiceAdmin, 
    TelegramBotServicePod
  ],
  exports: [
    TelegramBotServiceAdmin, 
    TelegramBotServicePod
  ],
})
export class TelegramBotModule {}
