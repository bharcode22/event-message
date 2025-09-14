import { Logger } from '@nestjs/common';
import { TelegramBotServicePod } from '../../telegram-bot/telegram-bot.service';

const escapeMarkdownV2 = (input?: any) => {
  if (input === undefined || input === null) return '';
  return String(input).replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
};

export class DockerResult {
  private readonly logger = new Logger(DockerResult.name);
  private messageTimers: Record<string, NodeJS.Timeout> = {};

  constructor(private readonly telegramService: TelegramBotServicePod) {}

  async handle(channel: any, exchange: string) {
    await channel.assertExchange(exchange, 'fanout', { durable: true });

    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, exchange, '');

    this.logger.log(`Listening for messages on exchange "${exchange}"...`);

    await channel.consume(q.queue, async (msg: any) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        this.logger.debug(`📥 Received result: ${JSON.stringify(content)}`);

        const messageText = this.formatMessage(content);

        // kirim ke telegram via TelegramBotServicePod (menggunakan CHAT_ID dari env)
        await this.telegramService.sendMessage(messageText);

        this.logger.log(
          `📤 Message forwarded to Telegram for host=${content.hostname} (${content.serverIp})`,
        );

        channel.ack(msg);
      } catch (err) {
        this.logger.error('❌ Failed to process message:', err);
        // jangan retry berulang-ulang: nack dan drop
        try {
          channel.nack(msg, false, false);
        } catch (e) {
          this.logger.error('❌ Failed to nack message:', e);
        }
      }
    });
  }

  private formatMessage(content: any): string {
    const command = content.command ?? '';
    const hostname = content.hostname ?? 'unknown';
    const serverIp = content.serverIp ?? 'unknown';
    const time = content.time ?? content.timestamp ?? new Date().toISOString();
    const result = content.result ?? {};

    // Header
    let message = `*📡 Docker Result*\n`;
    message += `*Host:* ${escapeMarkdownV2(hostname)}\n`;
    message += `*IP:* ${escapeMarkdownV2(serverIp)}\n`;
    message += `*Command:* ${escapeMarkdownV2(command)}\n`;
    message += `*Time:* ${escapeMarkdownV2(new Date(time).toLocaleString())}\n\n`;

    // Pesan ringkasan (jika ada)
    if (result?.message) {
      message += `${escapeMarkdownV2(result.message)}\n\n`;
    }

    // Daftar container (jika ada)
    if (Array.isArray(result?.containers) && result.containers.length > 0) {
      message += `*Daftar Container:*\n`;
      for (let i = 0; i < result.containers.length; i++) {
        const c = result.containers[i];
        // gunakan bullet emoji + em dash untuk meminimalkan karakter reserved
        const name = escapeMarkdownV2(c.name ?? c.Names ?? 'unknown');
        const id = escapeMarkdownV2(c.id ?? c.Id ?? '');
        const status = escapeMarkdownV2(c.status ?? c.Status ?? '');
        message += `• ${name} — ${id} — ${status}\n`;
      }
    }

    return message;
  }

  private resetTimer(exchange: string, cb: () => Promise<void>) {
    if (this.messageTimers[exchange]) {
      clearTimeout(this.messageTimers[exchange]);
    }
    this.messageTimers[exchange] = setTimeout(cb, 5000);
  }
}
