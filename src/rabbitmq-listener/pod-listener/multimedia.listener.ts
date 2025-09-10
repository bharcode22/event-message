import { Logger } from '@nestjs/common';
import { TelegramBotServicePod } from '../../telegram-bot/telegram-bot.service';
import * as path from 'path';

export class SaveMultimnediaFile {
    private readonly logger = new Logger(SaveMultimnediaFile.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const pod = content.podInfo?.[0] || {};
                const filePath = content.filePath || "-";
                const fileName = content.fileName || path.basename(filePath);

                function escapeMarkdownV2(text: string): string {
                    return text
                        .replace(/\\/g, '\\\\')
                        .replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
                }

                const ext = path.extname(fileName).toLowerCase();
                let fileEmoji = "📄";
                if ([".mp3", ".wav", ".flac", ".aac", ".ogg"].includes(ext)) {
                    fileEmoji = "🎵";
                } else if ([".mp4", ".avi", ".mov", ".mkv", ".webm"].includes(ext)) {
                    fileEmoji = "🎬";
                } else if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"].includes(ext)) {
                    fileEmoji = "🖼️";
                }

                const summary = `
📥 *Multimedia File Downloaded*

📌 *Pod Info:*
\`\`\`
🆔 ID        : ${escapeMarkdownV2(pod.id)}
📡 Pod Name  : ${escapeMarkdownV2(pod.name)}
🔌 MAC       : ${escapeMarkdownV2(pod.mac_address_pod)}
\`\`\`

${fileEmoji} *File Info:*
\`\`\`
📂 File Name : ${escapeMarkdownV2(fileName)}
📂 File Path : ${escapeMarkdownV2(filePath)}
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

export class SaveMultimnediaFileExist {
    private readonly logger = new Logger(SaveMultimnediaFile.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());
            try {
                const pod = content.podInfo?.[0] || {};
                const filePath = content.filePath || "-";
                const fileName = content.fileName || path.basename(filePath);

                function escapeMarkdownV2(text: string): string {
                    return text
                        .replace(/\\/g, '\\\\')
                        .replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
                }

                const ext = path.extname(fileName).toLowerCase();
                let fileEmoji = "📄";
                if ([".mp3", ".wav", ".flac", ".aac", ".ogg"].includes(ext)) {
                    fileEmoji = "🎵";
                } else if ([".mp4", ".avi", ".mov", ".mkv", ".webm"].includes(ext)) {
                    fileEmoji = "🎬";
                } else if ([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"].includes(ext)) {
                    fileEmoji = "🖼️";
                }

                const summary = `
📥 *Multimedia File Exist*

📌 *Pod Info:*
\`\`\`
🆔 ID        : ${escapeMarkdownV2(pod.id)}
📡 Pod Name  : ${escapeMarkdownV2(pod.name)}
🔌 MAC       : ${escapeMarkdownV2(pod.mac_address_pod)}
\`\`\`

${fileEmoji} *File Info:*
\`\`\`
📂 File Name : ${escapeMarkdownV2(fileName)}
📂 File Path : ${escapeMarkdownV2(filePath)}
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

export class SaveMultimediaFileEvent {
    private readonly logger = new Logger(SaveMultimediaFileEvent.name);

    constructor(private readonly telegramService: TelegramBotServicePod) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;
            const content = JSON.parse(msg.content.toString());

            try {
                const info = content.info || "-";
                const pod = content.podData?.[0] || {};
                const event = content.event || "-";

                function escapeMarkdownV2(text: any): string {
                    return String(text)
                        .replace(/\\/g, '\\\\')
                        .replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
                }

                const summary = `
${escapeMarkdownV2(info)}

📌 *Event Accepted at pod:*
\`\`\`
🆔 ID        : ${escapeMarkdownV2(pod.id || "-")}
📡 Pod Name  : ${escapeMarkdownV2(pod.name || "-")}
🔌 MAC       : ${escapeMarkdownV2(pod.mac_address_pod || "-")}
\`\`\`

\`\`\`
📂 Event : ${escapeMarkdownV2(JSON.stringify(event, null, 2))}
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
