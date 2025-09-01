import { Logger } from '@nestjs/common';
import { TelegramBotServiceAdmin } from '../../telegram-bot/telegram-bot.service';

export class adminProcessId {
    private readonly logger = new Logger(adminProcessId.name);
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
            const formattedMessage = `
- 🆔 Process Id: \`${parsed.process_id}\`

- 🎯 target_id: \`${parsed.target_id}\`

- ℹ info: \`${parsed.info}\`
`;

            this.resetTimer(exchange, async () => {
                await this.telegramService.sendMessage(formattedMessage);
                this.logger.log(`📩 [${exchange}] Event forwarded to Telegram`);
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
