import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { TelegramConsumeMessage } from '../../telegram-bot/telegram-bot.service';
import * as amqp from 'amqplib';
import * as os from 'os';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class DockerTelegramMessage implements OnModuleInit {
  private readonly logger = new Logger(DockerTelegramMessage.name);
  private channel: amqp.Channel;

  constructor(private readonly telegramService: TelegramConsumeMessage) {}

  private readonly allowedChatIds: string[] = (process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .filter((id) => id.trim());

  async onModuleInit() {
    this.logger.log('DockerTelegramService initialized.');
    await this.connectRabbitMQ();
    this.registerTelegramCommands();
  }

  private async connectRabbitMQ() {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await connection.createChannel();

      await this.channel.assertExchange(`${process.env.DOCKER_COMMANDS}`, 'fanout', { durable: true });
      this.logger.log('✅ Connected to RabbitMQ (commands exchange ready).');
    } catch (error) {
      this.logger.error('❌ RabbitMQ connection failed:', error);
    }
  }

  private publishCommand(command: string, payload: any) {
    if (!this.channel) {
      this.logger.error('RabbitMQ channel not available');
      return;
    }
    const message = {
      command,
      payload,
      hostname: os.hostname(),
      time: new Date().toISOString(),
    };
    this.channel.publish(
      `${process.env.DOCKER_COMMANDS}`,
      '',
      Buffer.from(JSON.stringify(message)),
    );
    this.logger.log(`📤 Command published: ${command} ${JSON.stringify(payload)}`);
  }

  private registerTelegramCommands() {
    // Debug handler
    this.telegramService.onText(/\/debug/, async (msg) => {
      const chatId = msg.chat.id;
      this.logger.debug(`Received /debug from chatId=${chatId}`);
      if (!this.isAuthorized(chatId)) return;
      this.logger.log(`Debug OK for chatId=${chatId}`);
      this.telegramService.sendMessage(chatId, `✅ Debug OK. Your chatId=${chatId}`);
    });

    // Container list
    this.telegramService.onText(/\/containers/, async (msg) => {
      this.logger.debug(`Received /containers from chatId=${msg.chat.id}`);
      if (!this.isAuthorized(msg.chat.id)) return;

      this.publishCommand('containers', { chatId: msg.chat.id });
      this.telegramService.sendMessage(msg.chat.id, '⏳ Request container list dikirim.');
    });

    // Restart container
    this.telegramService.onText(/\/restart (.+)/, async (msg, match) => {
      this.logger.debug(`Received /restart from chatId=${msg.chat.id}`);
      if (!this.isAuthorized(msg.chat.id)) return;

      const containerId = match?.[1];
      if (!containerId) {
        this.telegramService.sendMessage(msg.chat.id, '⚠️ Format salah. Gunakan: /restart <containerId>');
        return;
      }

      this.publishCommand('restart', { containerId, chatId: msg.chat.id });
      this.logger.log(`⏳ Restart command published for ${containerId}`);
      this.telegramService.sendMessage(msg.chat.id, `⏳ Restart command dikirim untuk ${containerId}`);
    });

    // Stop container
    this.telegramService.onText(/\/stop (.+)/, async (msg, match) => {
      this.logger.debug(`Received /stop from chatId=${msg.chat.id}`);
      if (!this.isAuthorized(msg.chat.id)) return;

      const containerId = match?.[1];
      if (!containerId) {
        this.telegramService.sendMessage(msg.chat.id, '⚠️ Format salah. Gunakan: /stop <containerId>');
        return;
      }

      this.publishCommand('stop', { containerId, chatId: msg.chat.id });
      this.logger.log(`⏳ Stop command published for ${containerId}`);
      this.telegramService.sendMessage(msg.chat.id, `⏳ Stop command dikirim untuk ${containerId}`);
    });
  }

  private isAuthorized(chatId: number): boolean {
    if (this.allowedChatIds.length === 0) return true;
    if (!this.allowedChatIds.includes(chatId.toString())) {
      this.logger.warn(`Unauthorized access attempt from chatId: ${chatId}`);
      this.telegramService.sendMessage(chatId, '⛔ Anda tidak diizinkan menggunakan bot ini.');
      return false;
    }
    return true;
  }
}
