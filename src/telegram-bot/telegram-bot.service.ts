import { Injectable, OnModuleInit } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private bot: TelegramBot;
  private readonly token = "7907582347:AAHFFbSQOB4XskWVi2dN3Hy7X8phLbqzPCI";
  private readonly chatId = "-1003076691771";

  onModuleInit() {
    this.bot = new TelegramBot(this.token, { polling: false });
    console.log('✅ Telegram bot connected');
  }

  async sendMessage(message: string) {
    if (!this.chatId) {
      console.error('❌ CHAT_ID not configured');
      return;
    }
    await this.bot.sendMessage(this.chatId, message);
  }
}
