import { Module } from '@nestjs/common';
import { TelegramConsumeMessage } from '../../telegram-bot/telegram-bot.service';
import { DockerTelegramMessage } from './tele.to.rabbit.service';

@Module({
  imports: [],
  providers: [
    TelegramConsumeMessage,
    DockerTelegramMessage,
  ],
  exports: [
    TelegramConsumeMessage,
    DockerTelegramMessage,
  ],
})
export class TeleToRabbitModule {}
