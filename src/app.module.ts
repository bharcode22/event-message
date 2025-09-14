import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { TeleToRabbitModule } from './rabbitmq-listener/message-from-telegram/tele.to.rabbit.module';
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
    TeleToRabbitModule, 
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
