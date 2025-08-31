import { Logger } from '@nestjs/common';
import { TelegramBotServiceAdmin } from '../../telegram-bot/telegram-bot.service';

export class AdminInfoListener {
    private readonly logger = new Logger(AdminInfoListener.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(private readonly telegramService: TelegramBotServiceAdmin) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        this.logger.log(`✅ Listening on exchange: ${exchange}`);

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = msg.content.toString();
            const parsed = JSON.parse(content);
            const admin = parsed.admin;
            const detail = parsed.detail;
            const message = `
👤 *Admin*
    - Username: ${admin.username}
    - Full Name: ${admin.full_names}
    - Email: ${admin.email}

📝 *Detail*
    - Action: ${detail.action}
    - Table: ${detail.model}
    - Created At: ${detail.createdAt}
`.trim();

            this.resetTimer(exchange, async () => {
                await this.telegramService.sendMessage(`${message}`);
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
