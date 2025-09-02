import { Logger } from '@nestjs/common';
import { TelegramBotServicePod } from '../../telegram-bot/telegram-bot.service';

export class InfoFlowEditorFile {
    private readonly logger = new Logger(InfoFlowEditorFile.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};
    private messageBuffer: Record<string, any[]> = {};

    constructor(private readonly telegramService: TelegramBotServicePod) {}

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

    if (tasks.length > 0) {
        const summary = tasks.map((task, idx) => {
            const podList = task.podInfo.map(p => 
                `  
• Pod Name: ${p.pod_name} 
• mac address pod: ${p.mac_address_pod}, 
• pod_id: ${p.id}`
            ).join("\n");

            return `📂 Flow Editor File Downloaded\n\n` +
                   `📝 File: \`${task.fileName}\`\n` +

`📦 Consumer:${podList}`;
        }).join("\n\n---\n\n");

        await this.telegramService.sendMessage(summary);
        this.logger.log(`📩 [${exchange}] Sent Telegram summary`);
    } else {
        this.logger.warn(`⚠️ [${exchange}] Received empty message, skipped sending`);
    }
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
