import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { RabbitmqListenerModule } from './rabbitmq-listener/rabbitmq-listener.module';

@Module({
  imports: [
    TelegramBotModule,
    RabbitmqListenerModule
  ],
  controllers: [],
  providers: [
    AppService
  ],
})
export class AppModule {}
