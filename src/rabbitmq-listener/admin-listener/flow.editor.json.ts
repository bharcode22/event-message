import { Logger } from '@nestjs/common';
import { TelegramBotServiceAdmin } from '../../telegram-bot/telegram-bot.service';

export class downloadFlowEditorJson {
    private readonly logger = new Logger(downloadFlowEditorJson.name);
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
📂 Flow Editor JSON created

- 🆔 Pod ID: \`${parsed.pod_id}\`

- 📁 File Path: \`${parsed.filePath}\`
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

export class ApplyFlowEditorJson {
    private readonly logger = new Logger(ApplyFlowEditorJson.name);
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
📂 Flow Editor JSON applyed to pod

- 🆔 Pod ID: \`${parsed.pod_id}\`

- 📁 File Name: \`${parsed.filename}\`
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
