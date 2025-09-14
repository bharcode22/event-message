import { Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class TelegramBotServiceAdmin implements OnModuleInit {
  private bot: TelegramBot;
  private readonly logger = new Logger(TelegramBotServiceAdmin.name);
  private readonly token = `${process.env.TELEGRAM_TOKEN_ADMIN}`;
  private readonly chatId = `${process.env.TELEGRAM_CHAT_ID}`;

  onModuleInit() {
    this.bot = new TelegramBot(this.token, { polling: false });
    this.logger.log(`🚀 Admin Telegram bot connected`);
  }

  async sendMessage(message: string, options?: TelegramBot.SendMessageOptions) {
    if (!this.chatId) {
      this.logger.error('❌ CHAT_ID not configured');
      return;
    }

    await this.bot.sendMessage(this.chatId, message, {
      parse_mode: 'MarkdownV2',
      ...options,
    });
  }
}

export class TelegramBotServicePod implements OnModuleInit {
  private bot: TelegramBot;
  private readonly logger = new Logger(TelegramBotServicePod.name);
  private readonly token = `${process.env.TELEGRAM_TOKEN_POD}`;
  private readonly chatId = `${process.env.TELEGRAM_CHAT_ID}`;

  onModuleInit() {
    this.bot = new TelegramBot(this.token, { polling: false });
    this.logger.log(`🚀 Pod Telegram bot connected`);
  }

  async sendMessage(message: string, options?: TelegramBot.SendMessageOptions) {
    if (!this.chatId) {
      this.logger.error('❌ CHAT_ID not configured');
      return;
    }

    await this.bot.sendMessage(this.chatId, message, {
      parse_mode: 'MarkdownV2',
      ...options,
    });
  }
}

@Injectable()
export class TelegramConsumeMessage implements OnModuleInit {
  private bot: TelegramBot;
  private readonly token = process.env.TELEGRAM_TOKEN_ADMIN;
  private readonly logger = new Logger(TelegramConsumeMessage.name);

  async onModuleInit() {
    if (!this.token) {
      throw new Error('TELEGRAM_TOKEN_ADMIN is not set');
    }

    this.bot = new TelegramBot(this.token, { polling: true });
    this.logger.log('✅ Telegram Bot connected (polling enabled)');

    await this.bot.setMyCommands([
      { command: 'debug', description: 'Cek bot dan lihat Chat ID' },
      { command: 'containers', description: 'Lihat daftar container yang berjalan' },
      { command: 'restart', description: 'Restart container (format: /restart <id>)' },
      { command: 'stop', description: 'Stop container (format: /stop <id>)' },
    ]);

    this.bot.on('message', (msg) => {
      this.logger.debug(
        `📩 New message from chatId=${msg.chat.id}: ${msg.text}`,
      );
    });
  }

  sendMessage(
    chatId: string | number,
    text: string,
    options?: TelegramBot.SendMessageOptions,
  ) {
    if (!this.bot) throw new Error('Telegram bot is not initialized yet');
    return this.bot.sendMessage(chatId, text, options);
  }

  onText(
    regex: RegExp,
    callback: (msg: TelegramBot.Message, match: RegExpExecArray | null) => void,
  ) {
    if (!this.bot) {
      setTimeout(() => this.onText(regex, callback), 500);
      return;
    }
    this.bot.onText(regex, callback);
  }

  onMessage(callback: (msg: TelegramBot.Message) => void) {
    if (!this.bot) {
      setTimeout(() => this.onMessage(callback), 500);
      return;
    }
    this.bot.on('message', callback);
  }
}
