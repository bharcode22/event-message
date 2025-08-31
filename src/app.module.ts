import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { RabbitmqListenerModule } from './rabbitmq-listener/rabbitmq-listener.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TelegramBotModule,
    RabbitmqListenerModule, 
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [
    AppService
  ],
})
export class AppModule {}
