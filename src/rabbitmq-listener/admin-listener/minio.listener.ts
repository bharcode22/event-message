import { Logger } from '@nestjs/common';
import { TelegramBotServiceAdmin } from '../../telegram-bot/telegram-bot.service';

export class MinioUploadMusicEventListener {
    private readonly logger = new Logger(MinioUploadMusicEventListener.name);
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

            this.resetTimer(exchange, async () => {
                const record = parsed?.Records?.[0];
                if (!record) return;

                const bucket = record.s3?.bucket?.name;
                const sizeMB = ((record.s3?.object?.size || 0) / (1024 * 1024)).toFixed(2);
                const uploader = record.userIdentity?.principalId;
                const eventTime = record.eventTime;

                const key = parsed.Key || parsed.Records?.[0]?.s3?.object?.key;
                const fileName = decodeURIComponent(key.split('/').pop() || "");
                const title = fileName.replace(/\.[^/.]+$/, "");
                const contentType = record.s3?.object?.contentType || "unknown";

                let audioMessage: string | undefined;
                if (contentType === 'audio/mpeg' || contentType === 'audio/wav') {
                    audioMessage = `deteacing duration, please wait...`;
                } else {
                    audioMessage = `not an audio file. skip duration detection.`;
                }

                function escapeMarkdownV2(text: string): string {
                    return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
                }

function formatMinioMessage({
    key,
    title,
    sizeMB,
    uploader,
    eventTime,
    contentType,
    audioMessage,
}: any): string {
    return `📡 *MinIO Upload Event Detected* 📡

\`\`\`
File        : ${escapeMarkdownV2(title)}
Path        : ${escapeMarkdownV2(key)}
Size        : ${escapeMarkdownV2(sizeMB + ' MB')}
Uploaded By : ${escapeMarkdownV2(uploader)}
Event Time  : ${escapeMarkdownV2(eventTime)}
Type        : ${escapeMarkdownV2(contentType)}
\`\`\`

🎧 ${escapeMarkdownV2(audioMessage)}`;
}

                const message = formatMinioMessage({
                    key,
                    title,
                    sizeMB,
                    uploader,
                    eventTime,
                    contentType,
                    audioMessage,
                });

                await this.telegramService.sendMessage(message, { parse_mode: 'MarkdownV2' });
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

export class DetectSongDuration {
    private readonly logger = new Logger(DetectSongDuration.name);
    private messageTimers: Record<string, NodeJS.Timeout> = {};

    constructor(private readonly telegramService: TelegramBotServiceAdmin) {}

    async handle(channel: any, exchange: string) {
        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');
        this.logger.log(`✅ Listening on exchange: ${exchange}`);

        await channel.consume(q.queue, async (msg: any) => {
            if (!msg) return;

            const parsed = JSON.parse(msg.content.toString());
            const fileName = parsed.tittle?.split('/').pop() || parsed.tittle;

            this.resetTimer(exchange, async () => {
                this.logger.log(`[${exchange}] Timer executed`);

function formatDurationMessage(parsed: any, fileName: string): string {
    const detectedAt = parsed.creaetdAt
        ? new Date(parsed.creaetdAt).toLocaleString('id-ID')
        : 'unknown';

    return `
🎵 *Duration Detected* 🎵

\`\`\`
🎶 Title       : ${fileName}
⏱️ Duration    : ${parsed.duration}
📅 Detected At : ${detectedAt}
\`\`\`
`.trim();
}

                    const message = formatDurationMessage(parsed, fileName);
                    await this.telegramService.sendMessage(message, { parse_mode: 'MarkdownV2' });
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
