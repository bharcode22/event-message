import { Module } from '@nestjs/common';
import { DockerTelegramMessage } from './tele.to.rabbit.service';
import { TelegramConsumeMessage } from '../../telegram-bot/telegram-bot.service';

@Module({
  imports: [],
  providers: [
    DockerTelegramMessage,
    TelegramConsumeMessage,
  ],
  exports: [
    DockerTelegramMessage,
    TelegramConsumeMessage,
  ],
})
export class TeleToRabbitModule {}
