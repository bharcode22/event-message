import { Logger } from '@nestjs/common';
import { TelegramBotServicePod } from '../../telegram-bot/telegram-bot.service';

const escapeMarkdownV2 = (input?: any): string => {
  if (input === undefined || input === null) return '';
  return String(input).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
};

export class DockerResult {
  private readonly logger = new Logger(DockerResult.name);
  private messageTimers: Record<string, NodeJS.Timeout> = {};

  constructor(private readonly telegramService: TelegramBotServicePod) {}

  async handle(channel: any, exchange: string) {
    await channel.assertExchange(exchange, 'fanout', { durable: true });

    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, exchange, '');

    this.logger.log(`📡 Listening for messages on exchange "${exchange}"...`);

    await channel.consume(q.queue, async (msg: any) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());

        const messageText = this.formatMessage(content);

        await this.telegramService.sendMessage(messageText);

        this.logger.log(
          `📤 Forwarded to Telegram: host=${content.hostname} ip=${content.serverIp}`,
        );

        channel.ack(msg);
      } catch (err) {
        this.logger.error('❌ Failed to process message:', err);
        if (err.response?.body) {
          this.logger.error('Telegram API response:', err.response.body);
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
    let message = `*🐳 DOCKER RESULT*\n\n`;
    message += `*🏷️ Host:* ${escapeMarkdownV2(hostname)}\n`;
    message += `*🌐 IP:* ${escapeMarkdownV2(serverIp)}\n`;
    message += `*⚡ Command:* \`${escapeMarkdownV2(command)}\`\n`;
    message += `*🕒 Time:* ${escapeMarkdownV2(
      new Date(time).toLocaleString(),
    )}\n\n`;

    // Separator
    message += `──────────────\n\n`;

    // Ringkasan
    if (result?.message) {
      message += `*📝 Summary:*\n${escapeMarkdownV2(result.message)}\n\n`;
    }

    // Daftar container
    if (Array.isArray(result?.containers) && result.containers.length > 0) {
      message += `*📦 Containers:* ${escapeMarkdownV2(result.containers.length)}\n\n`;

      for (const c of result.containers) {
        const name = escapeMarkdownV2(c.name ?? c.Names ?? 'unknown');
        const id = escapeMarkdownV2((c.id ?? c.Id ?? '').substring(0, 12));
        const status = this.formatContainerStatus(c.status ?? c.Status ?? '');
        const image = escapeMarkdownV2(c.image ?? c.Image ?? '');
        const state = escapeMarkdownV2(c.state ?? c.State ?? '');

        // Gunakan monospaced block agar mudah di-copy
        message += `\`\`\`\n`;
        message += `Name   : ${name}\n`;
        message += `ID     : ${id}\n`;
        message += `Status : ${status}\n`;
        if (image) message += `Image  : ${image}\n`;
        if (state) message += `State  : ${state}\n`;
        message += `\`\`\`\n\n`;
      }
    }

    // Footer
    message += `──────────────\n`;
    message += `_Generated at ${escapeMarkdownV2(
      new Date().toLocaleTimeString(),
    )}_`;

    return message;
  }

  private formatContainerStatus(status: string): string {
    if (status.includes('Up')) return `🟢 ${escapeMarkdownV2(status)}`;
    if (status.includes('Exit')) return `🔴 ${escapeMarkdownV2(status)}`;
    if (status.includes('Restarting'))
      return `🟡 ${escapeMarkdownV2(status)}`;
    if (status.includes('Paused')) return `⏸️ ${escapeMarkdownV2(status)}`;
    return escapeMarkdownV2(status);
  }

  private resetTimer(exchange: string, cb: () => Promise<void>) {
    if (this.messageTimers[exchange]) {
      clearTimeout(this.messageTimers[exchange]);
    }
    this.messageTimers[exchange] = setTimeout(cb, 5000);
  }
}
