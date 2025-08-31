import { Logger } from '@nestjs/common';
import { TelegramBotService } from '../../telegram-bot/telegram-bot.service';

export class CreateTaskListener {
    private readonly logger = new Logger(CreateTaskListener.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(private readonly telegramService: TelegramBotService) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        this.logger.log(`✅ Listening on exchange: ${exchange}`);

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = msg.content.toString();

            this.resetTimer(exchange, async () => {
                await this.telegramService.sendMessage(`Exchange: [${exchange}]`);
                this.logger.log(`📩 [${exchange}]`);
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

    constructor(private readonly telegramService: TelegramBotService) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        this.logger.log(`✅ Listening on exchange: ${exchange}`);

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = msg.content.toString();

            this.resetTimer(exchange, async () => {
                await this.telegramService.sendMessage(`Exchange: [${exchange}]`);
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
