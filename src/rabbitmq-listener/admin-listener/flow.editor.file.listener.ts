import { Logger } from '@nestjs/common';
import { TelegramBotServiceAdmin } from '../../telegram-bot/telegram-bot.service';

export class flowEditorFileListener {
    private readonly logger = new Logger(flowEditorFileListener.name);
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

const formatted = `
Flow Editor file uploaded

\`\`\`
📝 Event: ${escapeMarkdownV2(parsed.event)}
📂 File Name: ${escapeMarkdownV2(parsed.metadata.name)}
🖼️ File Path: ${escapeMarkdownV2(parsed.file.image)}
\`\`\`
`;

await this.telegramService.sendMessage(formatted, { parse_mode: 'MarkdownV2' });
            this.logger.log(`📩 [${exchange}] Event forwarded to Telegram`);

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
