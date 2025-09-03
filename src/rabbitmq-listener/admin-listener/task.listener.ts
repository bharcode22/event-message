import { Logger } from '@nestjs/common';
import { TelegramBotServiceAdmin } from '../../telegram-bot/telegram-bot.service';

const escapeMarkdownV2 = (text: string) =>
text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');

export class CreateTaskListener {
    private readonly logger = new Logger(CreateTaskListener.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};
    private messageBuffer: Record<string, any[]> = {};

    constructor(private readonly telegramService: TelegramBotServiceAdmin) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            if (!this.messageBuffer[exchange]) {
                this.messageBuffer[exchange] = [];
            }
            this.messageBuffer[exchange].push(content);

            this.resetTimer(exchange, async () => {
                const tasks = this.messageBuffer[exchange];
                this.messageBuffer[exchange] = [];

const summary = tasks[0]
  ? `• *pod_id*: \`${escapeMarkdownV2(tasks[0].pod_id)}\``
: '';

                await this.telegramService.sendMessage(`Create flow editor${summary ? `\n${summary}` : ''}`);

                this.logger.log(`🗑️ [${exchange}] ${content}`);
            });

            channel.ack(msg);
        });
    }

    private resetTimer(exchange: string, cb: () => Promise<void>) {
        if (this.messageTimers[exchange]) {
            clearTimeout(this.messageTimers[exchange]);
        }
        this.messageTimers[exchange] = setTimeout(cb, 5000);
    }
}

export class DeleteTaskListener {
    private readonly logger = new Logger(DeleteTaskListener.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(private readonly telegramService: TelegramBotServiceAdmin) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = msg.content.toString();
            this.resetTimer(exchange, async () => {
                await this.telegramService.sendMessage(`Delete flow editor`);
                this.logger.log(`🗑️ [${exchange}] ${content}`);
            });

            channel.ack(msg);
        });
    }

    private resetTimer(exchange: string, cb: () => Promise<void>) {
        if (this.messageTimers[exchange]) {
            clearTimeout(this.messageTimers[exchange]);
        }
        this.messageTimers[exchange] = setTimeout(cb, 5000);
    }
}
