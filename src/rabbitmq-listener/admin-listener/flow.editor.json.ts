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

function escapeMarkdownV2(text: string): string {
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

const formattedMessage = `
📂 *Flow Editor JSON Created*

\`\`\`
🆔  Pod ID    : ${escapeMarkdownV2(parsed.pod_id)}
📁  File Path : ${escapeMarkdownV2(parsed.filePath)}
\`\`\`
`.trim();

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

            function escapeMarkdownV2(text: string): string {
                return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
            }

const formattedMessage = `
📂 Flow Editor JSON applied admin to pod
\`\`\`
- 🆔 Pod ID: \`${escapeMarkdownV2(parsed.pod_id)}\`
- 📁 File Name: \`${escapeMarkdownV2(parsed.filename)}\`
\`\`\`
`;

            this.resetTimer(exchange, async () => {
                await this.telegramService.sendMessage(formattedMessage, { parse_mode: 'MarkdownV2' });
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
