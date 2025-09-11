import { Logger } from '@nestjs/common';
import { TelegramBotServicePod } from '../../telegram-bot/telegram-bot.service';

export class IsReloadStatus {
    private readonly logger = new Logger(IsReloadStatus.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const pod = content.podInfo?.[0] || {};
                const reloadStatus = content.reloadStatus;

                function escapeMarkdownV2Safe(text: any): string {
                    const str = String(text ?? ""); // convert semua tipe ke string
                    return str
                        .replace(/\\/g, '\\\\')
                        .replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
                }

                const summary = `
\`\`\`
📂 Is Reload : ${escapeMarkdownV2Safe(reloadStatus)}
📌 *Pod Info:*
🆔 ID        : ${escapeMarkdownV2Safe(pod.id)}
📡 Pod Name  : ${escapeMarkdownV2Safe(pod.name)}
🔌 MAC       : ${escapeMarkdownV2Safe(pod.mac_address_pod)}
\`\`\`

`.trim();

                await this.telegramService.sendMessage(summary);
            } catch (err) {
                this.logger.error(`Failed to format & send Telegram message: ${err.message}`);
            }

            channel.ack(msg);
        });
    }
}
