import { Injectable, OnModuleInit } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private bot: TelegramBot;
  private readonly token = `${process.env.TELEGRAM_TOKEN}`;
  private readonly chatId = `${process.env.TELEGRAM_CHAT_ID}`;

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
